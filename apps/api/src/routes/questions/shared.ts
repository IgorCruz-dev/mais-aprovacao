import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuth } from "@clerk/fastify";
import { Prisma } from "@mais-aprovacao/db";
import { prisma } from "../../lib/prisma.js";

export type AuthRole = "student" | "teacher" | "manager" | "parent" | "admin" | string;

export const DIFFICULTY_TO_DB: Record<string, string> = {
  easy: "Fácil",
  facil: "Fácil",
  "fácil": "Fácil",
  medium: "Médio",
  medio: "Médio",
  médio: "Médio",
  hard: "Difícil",
  dificil: "Difícil",
  "difícil": "Difícil",
};

export const DIFFICULTY_FROM_DB: Record<string, "easy" | "medium" | "hard"> = {
  Fácil: "easy",
  Médio: "medium",
  Difícil: "hard",
};

export type QuestionRow = {
  id: string;
  external_id: string;
  exam_year: number;
  subject: string | null;
  discipline: string | null;
  bank: string | null;
  difficulty: string | null;
  title: string | null;
  context: string | null;
  alternatives_intro: string | null;
  alternatives: Prisma.JsonValue | null;
  correct_alternative?: string | null;
  images: string[] | null;
  ai_reasoning?: Prisma.JsonValue | null;
  metadata?: Prisma.JsonValue | null;
  testlet_group_id?: string | null;
  created_at?: Date;
};

export function normalizeBank(value: unknown): string | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (["UFU", "UFU_VEST"].includes(normalized)) return "UFU";
  if (["UEG", "UEG_VEST"].includes(normalized)) return "UEG";
  if (["UFG", "UFG_VEST"].includes(normalized)) return "UFG";
  if (["ENEM", "INEP_ENEM", "ENEM_OFICIAL"].includes(normalized)) return "ENEM";
  if (["TODAS", "TODOS", "MISTO", "MISTA", "ALL", ""].includes(normalized)) return null;
  return normalized || null;
}

export function asRecord(value: Prisma.JsonValue | unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function inferBankFromQuestion(question: Pick<QuestionRow, "bank" | "metadata" | "external_id">): string {
  const direct = normalizeBank(question.bank);
  if (direct) return direct;

  const metadata = asRecord(question.metadata);
  const metadataBank = normalizeBank(metadata.bank ?? metadata.source);
  if (metadataBank) return metadataBank;

  const externalId = String(question.external_id ?? "").toUpperCase();
  if (externalId.startsWith("UFU_VEST_")) return "UFU";
  if (externalId.startsWith("UEG_VEST_")) return "UEG";
  if (externalId.startsWith("UFG_VEST_")) return "UFG";
  if (externalId.startsWith("UNESP_")) return "UNESP";
  return "ENEM";
}

function normalizeAlternatives(value: Prisma.JsonValue | null | undefined, correct?: string | null, includeCorrect = false) {
  let alternatives: unknown = value ?? [];
  if (typeof alternatives === "string") {
    try {
      alternatives = JSON.parse(alternatives);
    } catch {
      alternatives = [];
    }
  }
  if (!Array.isArray(alternatives)) return [];

  const correctLetter = String(correct ?? "").trim().toUpperCase();
  return alternatives
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const alt = item as Record<string, unknown>;
      const letter = String(alt.letter ?? alt.label ?? "").trim().toUpperCase();
      return {
        letter,
        text: String(alt.text ?? ""),
        image: (alt.file ?? alt.image ?? null) as string | null,
        ...(includeCorrect ? { isCorrect: Boolean(correctLetter && letter === correctLetter) } : {}),
      };
    })
    .filter((alt) => alt.letter);
}

export function getQuestionExplanation(question: Pick<QuestionRow, "ai_reasoning" | "metadata">): string {
  const aiReasoning = asRecord(question.ai_reasoning);
  const metadata = asRecord(question.metadata);
  return String(aiReasoning.thought ?? metadata.explanation ?? "Sem explicação detalhada.");
}

export function serializeQuestion(question: QuestionRow, options: { includeAnswer?: boolean; includeMetadata?: boolean } = {}) {
  const metadata = asRecord(question.metadata);
  const topic = question.discipline ?? (typeof metadata.ai_topic === "string" ? metadata.ai_topic : null);
  const context = question.context ?? "";
  const statement = question.alternatives_intro || (context ? "Assinale a alternativa correta:" : null);

  return {
    id: question.id,
    external_id: question.external_id,
    exam_year: question.exam_year,
    subject: question.subject,
    discipline: question.discipline,
    topic,
    bank: inferBankFromQuestion(question),
    difficulty: question.difficulty ? DIFFICULTY_FROM_DB[question.difficulty] ?? question.difficulty : null,
    title: question.title,
    context,
    statement,
    alternatives_intro: question.alternatives_intro,
    alternatives: normalizeAlternatives(question.alternatives, question.correct_alternative, Boolean(options.includeAnswer)),
    images: question.images ?? [],
    testlet_group_id: question.testlet_group_id ?? null,
    ...(options.includeAnswer ? {
      correct_alternative: question.correct_alternative ?? null,
      explanation: getQuestionExplanation(question),
    } : {}),
    ...(options.includeMetadata ? { metadata } : {}),
  };
}

export async function getCurrentUser(req: FastifyRequest, reply: FastifyReply) {
  const auth = getAuth(req);
  if (!auth.userId) {
    reply.status(401).send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    return null;
  }

  const user = await prisma.user.findUnique({ where: { clerk_id: auth.userId } });
  if (!user) {
    reply.status(404).send({ error: "User not found", code: "USER_NOT_FOUND" });
    return null;
  }

  return user;
}

export function getRole(req: FastifyRequest): AuthRole {
  const claims = getAuth(req).sessionClaims as Record<string, unknown> | undefined;
  const metadata = claims?.publicMetadata as Record<string, unknown> | undefined;
  return String(metadata?.role ?? claims?.role ?? "student");
}

export async function ensureStudentAccess(student_id: string): Promise<boolean> {
  const active = await prisma.enrollment.findFirst({
    where: {
      student_id,
      status: "active",
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
    select: { id: true },
  });
  return Boolean(active);
}

export async function requireStudentAccess(student_id: string, reply: FastifyReply): Promise<boolean> {
  const ok = await ensureStudentAccess(student_id);
  if (!ok) {
    reply.status(403).send({ error: "Active enrollment required", code: "CONTENT_LOCKED" });
    return false;
  }
  return true;
}

export function normalizeSelectedOption(value: unknown): string | null {
  const option = String(value ?? "").trim().toUpperCase();
  return /^[A-E]$/.test(option) ? option : null;
}

export function mapDifficultyToDb(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw || ["Todas", "Todos", "misto", "Misto"].includes(raw)) return null;
  return DIFFICULTY_TO_DB[raw.toLowerCase()] ?? raw;
}

export function parseLimit(value: unknown, fallback = 20, max = 100): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

export function encodeCursor(date: Date, id: string): string {
  return Buffer.from(JSON.stringify({ date: date.toISOString(), id })).toString("base64url");
}

export function decodeCursor(cursor: unknown): { date: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8")) as { date?: string; id?: string };
    if (!parsed.date || !parsed.id) return null;
    const date = new Date(parsed.date);
    return Number.isNaN(date.getTime()) ? null : { date, id: parsed.id };
  } catch {
    return null;
  }
}
