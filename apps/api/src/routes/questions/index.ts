import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../plugins/clerk.js";
import {
  asRecord,
  getCurrentUser,
  getRole,
  inferBankFromQuestion,
  mapDifficultyToDb,
  normalizeBank,
  parseLimit,
  serializeQuestion,
  type QuestionRow,
} from "./shared.js";

const listQuery = z.object({
  subject: z.string().optional(),
  discipline: z.string().optional(),
  topic: z.string().optional(),
  bank: z.string().optional(),
  difficulty: z.string().optional(),
  exam_year: z.coerce.number().int().optional(),
  tab: z.enum(["todo", "done"]).optional(),
  limit: z.coerce.number().optional(),
  cursor: z.string().optional(),
});

const topicsQuery = z.object({
  subject: z.string().optional(),
  bank: z.string().optional(),
});

function decodeOffset(cursor: string | undefined): number {
  if (!cursor) return 0;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { offset?: number };
    return Math.max(0, Number(parsed.offset ?? 0));
  } catch {
    return 0;
  }
}

function encodeOffset(offset: number): string {
  return Buffer.from(JSON.stringify({ offset })).toString("base64url");
}

function matchesTopic(question: QuestionRow, topic: string): boolean {
  const needle = topic.toLowerCase();
  const metadata = asRecord(question.metadata);
  return (
    String(question.discipline ?? "").toLowerCase().includes(needle) ||
    String(metadata.ai_topic ?? "").toLowerCase().includes(needle)
  );
}

export async function questionRoutes(app: FastifyInstance) {
  app.get("/questions", { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query", code: "VALIDATION_ERROR" });
    }

    const user = await getCurrentUser(req, reply);
    if (!user) return;

    const query = parsed.data;
    const limit = parseLimit(query.limit);
    const offset = decodeOffset(query.cursor);
    const requestedBank = normalizeBank(query.bank);
    const difficultyDb = mapDifficultyToDb(query.difficulty);

    const answeredIds = query.tab
      ? new Set(
          (
            await prisma.questionAttempt.findMany({
              where: { student_id: user.id },
              distinct: ["question_id"],
              select: { question_id: true },
            })
          ).map((attempt) => attempt.question_id)
        )
      : null;

    const rows = await prisma.question.findMany({
      where: {
        is_verified: true,
        ...(query.subject ? { subject: { contains: query.subject, mode: "insensitive" } } : {}),
        ...(query.discipline ? { discipline: { contains: query.discipline, mode: "insensitive" } } : {}),
        ...(query.exam_year ? { exam_year: query.exam_year } : {}),
        ...(difficultyDb ? { difficulty: difficultyDb } : {}),
      },
      orderBy: [{ exam_year: "desc" }, { created_at: "asc" }],
      take: Math.max(limit * 6, 100),
      skip: offset,
    });

    const filtered = (rows as QuestionRow[]).filter((question) => {
      if (requestedBank && inferBankFromQuestion(question) !== requestedBank) return false;
      if (query.topic && !matchesTopic(question, query.topic)) return false;
      if (answeredIds && query.tab === "done" && !answeredIds.has(question.id)) return false;
      if (answeredIds && query.tab === "todo" && answeredIds.has(question.id)) return false;
      return true;
    });

    const page = filtered.slice(0, limit);
    const nextCursor = rows.length === Math.max(limit * 6, 100) || filtered.length > limit
      ? encodeOffset(offset + rows.length)
      : null;

    return reply.send({
      questions: page.map((question) => serializeQuestion(question)),
      next_cursor: nextCursor,
    });
  });

  app.get("/questions/topics", { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = topicsQuery.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid query", code: "VALIDATION_ERROR" });
    }

    const requestedBank = normalizeBank(parsed.data.bank);
    const rows = await prisma.question.findMany({
      where: {
        is_verified: true,
        ...(parsed.data.subject ? { subject: { contains: parsed.data.subject, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        external_id: true,
        bank: true,
        discipline: true,
        metadata: true,
      },
      take: 5000,
    });

    const counts = new Map<string, number>();
    for (const row of rows as Array<Pick<QuestionRow, "id" | "external_id" | "bank" | "discipline" | "metadata">>) {
      if (requestedBank && inferBankFromQuestion(row) !== requestedBank) continue;
      const metadata = asRecord(row.metadata);
      const topic = String(row.discipline ?? metadata.ai_topic ?? "").trim();
      if (topic.length <= 2) continue;
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }

    const topics = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return reply.send({ topics });
  });

  app.get("/questions/:id", { preHandler: [requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    const query = z.object({ include_answer: z.coerce.boolean().optional() }).safeParse(req.query);
    if (!params.success || !query.success) {
      return reply.status(400).send({ error: "Invalid request", code: "VALIDATION_ERROR" });
    }

    const includeAnswer = Boolean(query.data.include_answer);
    const role = getRole(req);
    if (includeAnswer && !["teacher", "admin"].includes(role)) {
      return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
    }

    const question = await prisma.question.findFirst({
      where: { id: params.data.id, is_verified: true },
    });
    if (!question) {
      return reply.status(404).send({ error: "Question not found", code: "QUESTION_NOT_FOUND" });
    }

    return reply.send({
      question: serializeQuestion(question as QuestionRow, {
        includeAnswer,
        includeMetadata: includeAnswer,
      }),
    });
  });
}
