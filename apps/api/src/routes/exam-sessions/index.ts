import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../plugins/clerk.js";
import {
  asRecord,
  getCurrentUser,
  getQuestionExplanation,
  inferBankFromQuestion,
  mapDifficultyToDb,
  normalizeBank,
  normalizeSelectedOption,
  parseLimit,
  requireStudentAccess,
  serializeQuestion,
  type QuestionRow,
} from "../questions/shared.js";

type Bucket = { correct: number; total: number; percentage: number };

const ENEM_BLOCKS: Record<string, string[] | null> = {
  linguagens: ["Língua Portuguesa", "Espanhol", "Inglês"],
  humanas: ["História", "Geografia", "Filosofia", "Sociologia"],
  natureza: ["Biologia", "Química", "Física"],
  matematica: ["Matemática"],
  dia1: ["Língua Portuguesa", "Espanhol", "Inglês", "História", "Geografia", "Filosofia", "Sociologia"],
  dia2: ["Biologia", "Química", "Física", "Matemática"],
  completo: null,
};
const ENEM_BLOCK_QTY: Record<string, number> = { linguagens: 45, humanas: 45, natureza: 45, matematica: 45, dia1: 90, dia2: 90, completo: 180 };
const COMPOSITE_BLOCKS: Record<string, string[]> = { dia1: ["linguagens", "humanas"], dia2: ["natureza", "matematica"], completo: ["linguagens", "humanas", "natureza", "matematica"] };
const UFU_BLOCKS: Record<string, string[] | null> = {
  linguagens: ["Língua Portuguesa", "Literatura", "Espanhol", "Inglês", "Francês"],
  humanas: ["História", "Geografia", "Filosofia", "Sociologia"],
  natureza: ["Biologia", "Química", "Física"],
  matematica: ["Matemática"],
  completo: null,
};
const UFU_BLOCK_QTY: Record<string, number> = { linguagens: 20, humanas: 20, natureza: 15, matematica: 10, completo: 65 };
const UEG_BLOCKS: Record<string, string[] | null> = {
  linguagens: ["Língua Portuguesa", "Espanhol", "Inglês"],
  humanas: ["História", "Geografia", "Filosofia", "Sociologia"],
  natureza: ["Biologia", "Química", "Física"],
  matematica: ["Matemática"],
  completo: null,
};
const UEG_BLOCK_QTY: Record<string, number> = { linguagens: 13, humanas: 13, natureza: 13, matematica: 13, completo: 52 };
const UFG_BLOCKS: Record<string, string[] | null> = {
  linguagens: ["Língua Portuguesa"],
  humanas: ["História", "Geografia", "Filosofia", "Sociologia"],
  natureza: ["Biologia", "Química", "Física"],
  matematica: ["Matemática"],
  completo: null,
};
const UFG_BLOCK_QTY: Record<string, number> = { linguagens: 24, humanas: 24, natureza: 24, matematica: 24, completo: 96 };
const UFU_COMPLETE_SUBJECT_DISTRIBUTION: Record<string, number> = {
  "Língua Portuguesa": 10,
  Literatura: 5,
  Inglês: 2,
  Espanhol: 2,
  Francês: 1,
  Matemática: 10,
  Biologia: 5,
  Física: 5,
  Química: 5,
  Geografia: 5,
  História: 5,
  Filosofia: 5,
  Sociologia: 5,
};
const UEG_COMPLETE_AREA_DISTRIBUTION: Record<string, Record<string, number>> = {
  linguagens: { "Língua Portuguesa": 3, Literatura: 2, Inglês: 2, Espanhol: 2, Artes: 2, "Educação Física": 1, "Tecnologias da Informação e Comunicação": 1 },
  matematica: { Matemática: 13 },
  natureza: { Biologia: 5, Física: 4, Química: 4 },
  humanas: { História: 4, Geografia: 3, Filosofia: 3, Sociologia: 3 },
};
const UFG_COMPLETE_SUBJECT_DISTRIBUTION: Record<string, number> = {
  "Língua Portuguesa": 24,
  Matemática: 24,
  Biologia: 8,
  Física: 8,
  Química: 8,
  História: 6,
  Geografia: 6,
  Filosofia: 6,
  Sociologia: 6,
};

const startBody = z.object({
  course_id: z.string().uuid().optional(),
  question_ids: z.array(z.string().uuid()).optional(),
  config: z.object({
    format: z.string().optional(),
    bank: z.string().nullable().optional(),
    year: z.number().int().nullable().optional(),
    subject: z.string().nullable().optional(),
    difficulty: z.string().nullable().optional(),
    qty: z.number().int().positive().max(200).nullable().optional(),
    time_limit_secs: z.number().int().positive().nullable().optional(),
  }).optional(),
  is_printed: z.boolean().optional(),
});

const patchAnswerBody = z.object({ selected_option: z.string().optional().nullable() });
const completeBody = z.object({ time_taken_secs: z.number().int().nonnegative().optional() }).optional();

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getBlockSubjects(format: string, bank: string | null): string[] | null | undefined {
  if (bank === "UFU") return UFU_BLOCKS[format];
  if (bank === "UEG") return UEG_BLOCKS[format];
  if (bank === "UFG") return UFG_BLOCKS[format];
  return ENEM_BLOCKS[format];
}

function getBlockQty(format: string, bank: string | null): number {
  if (bank === "UFU") return UFU_BLOCK_QTY[format] ?? 10;
  if (bank === "UEG") return UEG_BLOCK_QTY[format] ?? 10;
  if (bank === "UFG") return UFG_BLOCK_QTY[format] ?? 10;
  return ENEM_BLOCK_QTY[format] ?? 10;
}

function isBlockFormat(format: string, bank: string | null): boolean {
  if (bank === "UFU") return Object.hasOwn(UFU_BLOCKS, format);
  if (bank === "UEG") return Object.hasOwn(UEG_BLOCKS, format);
  if (bank === "UFG") return Object.hasOwn(UFG_BLOCKS, format);
  return Object.hasOwn(ENEM_BLOCKS, format);
}

function testletOrder(question: QuestionRow): number {
  const metadata = asRecord(question.metadata);
  const value = metadata.testlet_order;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function coalesceTestlets(questions: QuestionRow[]): QuestionRow[] {
  const grouped = new Map<string, QuestionRow[]>();
  const firstPositions = new Map<string, number>();
  const singles: Array<{ index: number; question: QuestionRow }> = [];

  questions.forEach((question, index) => {
    const group = question.testlet_group_id;
    if (!group) {
      singles.push({ index, question });
      return;
    }
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(question);
    if (!firstPositions.has(group)) firstPositions.set(group, index);
  });

  const items: Array<{ index: number; questions: QuestionRow[] }> = [];
  for (const [group, groupQuestions] of grouped.entries()) {
    items.push({
      index: firstPositions.get(group) ?? 0,
      questions: [...groupQuestions].sort((a, b) => testletOrder(a) - testletOrder(b)),
    });
  }
  for (const single of singles) items.push({ index: single.index, questions: [single.question] });
  return items.sort((a, b) => a.index - b.index).flatMap((item) => item.questions);
}

async function fetchQuestionsCustom(args: {
  subject?: string | null;
  qty: number;
  year?: number | null;
  difficultyDb?: string | null;
  bank?: string | null;
}): Promise<QuestionRow[]> {
  const rows = await prisma.question.findMany({
    where: {
      is_verified: true,
      ...(args.subject ? { subject: args.subject } : {}),
      ...(args.year ? { exam_year: args.year } : {}),
      ...(args.difficultyDb ? { difficulty: args.difficultyDb } : {}),
    },
    orderBy: [{ exam_year: "desc" }, { created_at: "asc" }],
    take: Math.max(args.qty * 4, args.qty, 100),
  });
  const filtered = (rows as QuestionRow[]).filter((q) => !args.bank || inferBankFromQuestion(q) === args.bank);
  return shuffle(filtered).slice(0, args.qty);
}

async function fetchQuestionsForBlock(subjects: string[] | null | undefined, qty: number, year?: number | null, difficultyDb?: string | null, bank?: string | null) {
  if (!subjects) return fetchQuestionsCustom({ qty, year, difficultyDb, bank });
  const rows = await prisma.question.findMany({
    where: {
      is_verified: true,
      subject: { in: subjects },
      ...(year ? { exam_year: year } : {}),
      ...(difficultyDb ? { difficulty: difficultyDb } : {}),
    },
    orderBy: [{ exam_year: "desc" }, { created_at: "asc" }],
    take: Math.max(qty * 4, qty, 100),
  });
  const filtered = (rows as QuestionRow[]).filter((q) => !bank || inferBankFromQuestion(q) === bank);
  return shuffle(filtered).slice(0, qty);
}

async function fetchQuestionsWithSubjectQuota(subjectQuota: Record<string, number>, year?: number | null, difficultyDb?: string | null, bank?: string | null) {
  const selected: QuestionRow[] = [];
  const selectedIds = new Set<string>();
  for (const [subject, qty] of Object.entries(subjectQuota)) {
    const batch = await fetchQuestionsCustom({ subject, qty, year, difficultyDb, bank });
    for (const question of batch) {
      if (selectedIds.has(question.id)) continue;
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  const target = Object.values(subjectQuota).reduce((sum, qty) => sum + Math.max(0, qty), 0);
  let missing = target - selected.length;
  if (missing > 0) {
    const fallback = await fetchQuestionsForBlock(Object.keys(subjectQuota), target * 3, year, difficultyDb, bank);
    for (const question of fallback) {
      if (missing <= 0) break;
      if (selectedIds.has(question.id)) continue;
      selected.push(question);
      selectedIds.add(question.id);
      missing -= 1;
    }
  }
  return selected.slice(0, target);
}

async function buildQuestionsForConfig(config: Record<string, unknown>, studentId: string): Promise<QuestionRow[] | "INVALID_FORMAT"> {
  const format = String(config.format ?? "custom").toLowerCase();
  const bank = normalizeBank(config.bank);
  const year = typeof config.year === "number" ? config.year : null;
  const subject = typeof config.subject === "string" ? config.subject : null;
  const difficultyDb = mapDifficultyToDb(config.difficulty);
  const qty = Number(config.qty ?? getBlockQty(format, bank));
  let raw: QuestionRow[] = [];

  if (bank === "UFU" && format === "completo") {
    raw = await fetchQuestionsWithSubjectQuota(UFU_COMPLETE_SUBJECT_DISTRIBUTION, year, difficultyDb, "UFU");
  } else if (bank === "UEG" && format === "completo") {
    const parts = await Promise.all(Object.values(UEG_COMPLETE_AREA_DISTRIBUTION).map((quota) => fetchQuestionsWithSubjectQuota(quota, year, difficultyDb, "UEG")));
    raw = parts.flat().slice(0, UEG_BLOCK_QTY.completo);
  } else if (bank === "UFG" && format === "completo") {
    raw = await fetchQuestionsWithSubjectQuota(UFG_COMPLETE_SUBJECT_DISTRIBUTION, year, difficultyDb, "UFG");
  } else if (Object.hasOwn(COMPOSITE_BLOCKS, format) && !["UFU", "UEG", "UFG"].includes(bank ?? "")) {
    const perBlock = Math.floor(getBlockQty(format, bank) / COMPOSITE_BLOCKS[format].length);
    const parts = await Promise.all(COMPOSITE_BLOCKS[format].map((block) => fetchQuestionsForBlock(getBlockSubjects(block, bank), perBlock, year, difficultyDb, bank ?? "ENEM")));
    raw = parts.flat();
  } else if (isBlockFormat(format, bank) && !Object.hasOwn(COMPOSITE_BLOCKS, format)) {
    raw = await fetchQuestionsForBlock(getBlockSubjects(format, bank), qty, year, difficultyDb, bank ?? "ENEM");
  } else if (format === "custom") {
    raw = await fetchQuestionsCustom({ subject, qty, year, difficultyDb, bank });
  } else {
    return "INVALID_FORMAT";
  }

  const answered = await prisma.questionAttempt.findMany({
    where: { student_id: studentId, question_id: { in: raw.map((q) => q.id) } },
    select: { question_id: true },
  });
  const answeredIds = new Set(answered.map((item) => item.question_id));
  const unseen = shuffle(raw.filter((q) => !answeredIds.has(q.id)));
  const seen = shuffle(raw.filter((q) => answeredIds.has(q.id)));
  return coalesceTestlets([...unseen, ...seen].slice(0, qty));
}

function correctLetter(question: QuestionRow): string {
  return String(question.correct_alternative ?? "").trim().toUpperCase();
}

function isTriEligible(config: Record<string, unknown>) {
  const bank = normalizeBank(config.bank);
  const format = String(config.format ?? "").toLowerCase();
  return (Object.hasOwn(ENEM_BLOCKS, format) && !["UFU", "UEG", "UFG"].includes(bank ?? "")) || bank === "ENEM";
}

const B_PARAM: Record<string, number> = { Fácil: -1, Médio: 0, Difícil: 1 };
function triProbability(theta: number, b: number) {
  return 0.2 + 0.8 / (1 + Math.exp(-1.7 * (theta - b)));
}
function calculateTri(items: Array<{ difficulty: string | null; is_correct: boolean }>) {
  if (!items.length) return 500.0;
  let theta = 0;
  for (let i = 0; i < 100; i += 1) {
    let num = 0;
    let den = 0;
    for (const item of items) {
      const b = B_PARAM[item.difficulty ?? "Médio"] ?? 0;
      const p = triProbability(theta, b);
      const u = item.is_correct ? 1 : 0;
      if (p <= 0.2 || p >= 1) continue;
      const d = (p - 0.2) / (0.8 * p * (1 - p));
      num += (u - p) * d;
      den += p * (1 - p) * d * d;
    }
    if (Math.abs(den) < 1e-9) break;
    const delta = num / den;
    theta += delta;
    if (Math.abs(delta) < 0.001) break;
  }
  theta = Math.max(-4, Math.min(4, theta));
  return Math.round(Math.max(200, Math.min(900, 500 + theta * 100)) * 10) / 10;
}

function pct(correct: number, total: number) {
  return total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
}

function todayUtcDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function callAiExplanation(questionId: string): Promise<string | null> {
  const baseUrl = process.env.AI_SERVICE_URL;
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/ai/questions/${questionId}/explanation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": process.env.AI_SERVICE_SECRET ?? "" },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { explanation?: string };
    return body.explanation?.trim() || null;
  } catch {
    return null;
  }
}

export async function examSessionRoutes(app: FastifyInstance) {
  app.post("/exam-sessions", { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = startBody.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    if (!(await requireStudentAccess(user.id, reply))) return;

    let questions: QuestionRow[] = [];
    const config = parsed.data.config ?? {};
    if (parsed.data.question_ids?.length) {
      const rows = await prisma.question.findMany({ where: { id: { in: parsed.data.question_ids }, is_verified: true } });
      const byId = new Map((rows as QuestionRow[]).map((q) => [q.id, q]));
      questions = parsed.data.question_ids.map((id) => byId.get(id)).filter((q): q is QuestionRow => Boolean(q));
      if (questions.length !== parsed.data.question_ids.length) {
        return reply.status(404).send({ error: "Question not found", code: "QUESTION_NOT_FOUND" });
      }
    } else {
      const built = await buildQuestionsForConfig(config, user.id);
      if (built === "INVALID_FORMAT") return reply.status(400).send({ error: "Invalid format", code: "INVALID_FORMAT" });
      questions = built;
    }

    if (!questions.length) return reply.status(404).send({ error: "No questions found", code: "NO_QUESTIONS_FOUND" });
    const questionIds = questions.map((q) => q.id);
    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.examSession.create({
        data: {
          student_id: user.id,
          course_id: parsed.data.course_id ?? null,
          config: { ...config, bank: normalizeBank(config.bank) ?? config.bank ?? null },
          question_ids: questionIds,
          status: "in_progress",
          total_questions: questionIds.length,
          correct_count: null,
          score: null,
          is_printed: parsed.data.is_printed ?? false,
        },
      });
      await tx.examSessionAnswer.createMany({
        data: questionIds.map((question_id, order_index) => ({
          session_id: created.id,
          question_id,
          order_index,
          selected_option: null,
        })),
      });
      return created;
    });

    const answers = await prisma.examSessionAnswer.findMany({ where: { session_id: session.id }, orderBy: { order_index: "asc" } });
    return reply.status(201).send({
      exam_session: {
        id: session.id,
        student_id: session.student_id,
        course_id: session.course_id,
        status: session.status,
        total_questions: session.total_questions,
        correct_count: session.correct_count,
        score: session.score,
        is_printed: session.is_printed,
        started_at: session.started_at.toISOString(),
        config: session.config,
      },
      answers,
      questions: questions.map((q) => serializeQuestion(q)),
    });
  });

  app.patch("/exam-sessions/:id/answers/:questionId", { preHandler: [requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid(), questionId: z.string().uuid() }).safeParse(req.params);
    const body = patchAnswerBody.safeParse(req.body);
    if (!params.success || !body.success) return reply.status(400).send({ error: "Invalid request", code: "VALIDATION_ERROR" });
    const selected = normalizeSelectedOption(body.data.selected_option);
    if (!selected) return reply.status(400).send({ error: "Invalid selected option", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    const session = await prisma.examSession.findUnique({ where: { id: params.data.id } });
    if (!session) return reply.status(404).send({ error: "Exam session not found", code: "EXAM_SESSION_NOT_FOUND" });
    if (session.student_id !== user.id) return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
    if (session.status !== "in_progress") return reply.status(409).send({ error: "Exam session closed", code: "EXAM_SESSION_CLOSED" });
    const answer = await prisma.examSessionAnswer.update({
      where: { session_id_question_id: { session_id: session.id, question_id: params.data.questionId } },
      data: { selected_option: selected, answered_at: new Date() },
    });
    return reply.send({ answer });
  });

  app.post("/exam-sessions/:id/complete", { preHandler: [requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    const body = completeBody.safeParse(req.body);
    if (!params.success || !body.success) return reply.status(400).send({ error: "Invalid request", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    const session = await prisma.examSession.findUnique({
      where: { id: params.data.id },
      include: { answers: { orderBy: { order_index: "asc" }, include: { question: true } } },
    });
    if (!session) return reply.status(404).send({ error: "Exam session not found", code: "EXAM_SESSION_NOT_FOUND" });
    if (session.student_id !== user.id) return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
    if (session.status === "completed") return reply.status(409).send({ error: "Exam session closed", code: "EXAM_SESSION_CLOSED" });

    const answeredCount = session.answers.filter((a) => a.selected_option).length;
    const totalOriginal = session.answers.length;
    const minimumRequired = Math.max(1, Math.ceil(totalOriginal * 0.5));
    if (answeredCount < minimumRequired) {
      return reply.status(400).send({
        error: "Minimum answers not reached",
        code: "MIN_ANSWERS_NOT_REACHED",
        answered_count: answeredCount,
        minimum_required: minimumRequired,
        total_questions: totalOriginal,
      });
    }

    const reported = await prisma.questionReport.findMany({
      where: { student_id: user.id, question_id: { in: session.answers.map((a) => a.question_id) }, status: { in: ["pending", "reviewing"] } },
      select: { question_id: true },
    });
    const reportedIds = new Set(reported.map((r) => r.question_id));
    let score = 0;
    const bySubject: Record<string, Bucket> = {};
    const byBank: Record<string, Bucket> = {};
    const triItems: Array<{ difficulty: string | null; is_correct: boolean }> = [];

    for (const answer of session.answers) {
      const question = answer.question as QuestionRow;
      const annulled = reportedIds.has(answer.question_id);
      const selected = String(answer.selected_option ?? "").toUpperCase();
      const correct = correctLetter(question);
      const isCorrect = Boolean(selected && selected === correct && !annulled);
      if (isCorrect) score += 1;

      if (!annulled) {
        const subject = question.subject ?? "Desconhecida";
        const bank = inferBankFromQuestion(question);
        bySubject[subject] ??= { correct: 0, total: 0, percentage: 0 };
        byBank[bank] ??= { correct: 0, total: 0, percentage: 0 };
        bySubject[subject].total += 1;
        byBank[bank].total += 1;
        if (isCorrect) {
          bySubject[subject].correct += 1;
          byBank[bank].correct += 1;
        }
        triItems.push({ difficulty: question.difficulty, is_correct: isCorrect });
      }

      await prisma.examSessionAnswer.update({
        where: { id: answer.id },
        data: { is_correct: isCorrect, is_annulled: annulled },
      });
    }
    for (const bucket of Object.values(bySubject)) bucket.percentage = pct(bucket.correct, bucket.total);
    for (const bucket of Object.values(byBank)) bucket.percentage = pct(bucket.correct, bucket.total);

    const total = Math.max(totalOriginal - reportedIds.size, 0);
    const percentage = pct(score, total);
    const config = asRecord(session.config);
    const triScore = isTriEligible(config) ? calculateTri(triItems) : null;
    const finishedAt = new Date();
    const updatedConfig = { ...config, results_by_bank: byBank, percentage, annulled_question_ids: Array.from(reportedIds) };

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.examSession.update({
        where: { id: session.id },
        data: {
          status: "completed",
          score,
          correct_count: score,
          total_questions: total,
          time_taken_secs: body.data?.time_taken_secs ?? null,
          tri_score: triScore,
          results_by_subject: bySubject,
          config: updatedConfig,
          finished_at: finishedAt,
        },
      });
      await tx.dailyUsage.upsert({
        where: { student_id_usage_date: { student_id: user.id, usage_date: todayUtcDate() } },
        create: { student_id: user.id, usage_date: todayUtcDate(), questions_count: 0, simulations_count: 1 },
        update: { simulations_count: { increment: 1 } },
      });
      return row;
    });

    return reply.send({
      exam_session: {
        id: updated.id,
        status: "completed",
        total_questions: total,
        correct_count: score,
        score,
        percentage,
        tri_score: triScore,
        results_by_subject: bySubject,
        results_by_bank: byBank,
        annulled_question_ids: Array.from(reportedIds),
        annulled_questions_count: reportedIds.size,
        time_taken_secs: updated.time_taken_secs,
        finished_at: finishedAt.toISOString(),
        points_awarded: 0,
      },
    });
  });

  app.get("/exam-sessions/me", { preHandler: [requireAuth] }, async (req, reply) => {
    const query = z.object({ status: z.enum(["in_progress", "completed", "abandoned"]).optional(), limit: z.coerce.number().optional(), cursor: z.string().optional() }).safeParse(req.query);
    if (!query.success) return reply.status(400).send({ error: "Invalid query", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    const limit = parseLimit(query.data.limit);
    const cursorDate = query.data.cursor ? new Date(query.data.cursor) : null;
    const rows = await prisma.examSession.findMany({
      where: { student_id: user.id, ...(query.data.status ? { status: query.data.status } : {}), ...(cursorDate && !Number.isNaN(cursorDate.getTime()) ? { started_at: { lt: cursorDate } } : {}) },
      orderBy: { started_at: "desc" },
      take: limit + 1,
    });
    const page = rows.slice(0, limit);
    return reply.send({
      exam_sessions: page.map((s) => ({
        id: s.id,
        course_id: s.course_id,
        status: s.status,
        total_questions: s.total_questions,
        correct_count: s.correct_count,
        score: s.score,
        tri_score: s.tri_score == null ? null : Number(s.tri_score),
        is_printed: s.is_printed,
        started_at: s.started_at.toISOString(),
        finished_at: s.finished_at?.toISOString() ?? null,
        config: s.config,
      })),
      next_cursor: rows.length > limit ? page.at(-1)?.started_at.toISOString() ?? null : null,
    });
  });

  app.get("/exam-sessions/:id", { preHandler: [requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return reply.status(400).send({ error: "Invalid request", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    const session = await prisma.examSession.findUnique({ where: { id: params.data.id }, include: { answers: { include: { question: true }, orderBy: { order_index: "asc" } } } });
    if (!session) return reply.status(404).send({ error: "Exam session not found", code: "EXAM_SESSION_NOT_FOUND" });
    if (session.student_id !== user.id) return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });
    return reply.send({
      exam_session: {
        id: session.id,
        student_id: session.student_id,
        course_id: session.course_id,
        status: session.status,
        total_questions: session.total_questions,
        correct_count: session.correct_count,
        score: session.score,
        tri_score: session.tri_score == null ? null : Number(session.tri_score),
        results_by_subject: session.results_by_subject,
        config: session.config,
        is_printed: session.is_printed,
        answer_sheet_image_url: session.answer_sheet_image_url,
        ocr_status: session.ocr_status,
        started_at: session.started_at.toISOString(),
        finished_at: session.finished_at?.toISOString() ?? null,
      },
      answers: session.answers.map((answer) => ({
        id: answer.id,
        question_id: answer.question_id,
        order_index: answer.order_index,
        selected_option: answer.selected_option,
        is_correct: answer.is_correct,
        is_annulled: answer.is_annulled,
        answered_at: answer.answered_at?.toISOString() ?? null,
        question: serializeQuestion(answer.question as QuestionRow),
      })),
    });
  });

  app.get("/exam-sessions/:id/review", { preHandler: [requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return reply.status(400).send({ error: "Invalid request", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    const session = await prisma.examSession.findUnique({ where: { id: params.data.id }, include: { answers: { include: { question: true }, orderBy: { order_index: "asc" } } } });
    if (!session) return reply.status(404).send({ error: "Exam session not found", code: "EXAM_SESSION_NOT_FOUND" });
    if (session.student_id !== user.id) return reply.status(403).send({ error: "Forbidden", code: "FORBIDDEN" });

    const explanations: Record<string, unknown> = {};
    for (const answer of session.answers) {
      const question = answer.question as QuestionRow;
      let explanation = getQuestionExplanation(question);
      if (!explanation || explanation === "Sem explicação detalhada.") {
        const cached = await prisma.questionExplanation.findUnique({ where: { question_id: question.id } });
        explanation = cached?.explanation ?? "";
      }
      if (!explanation) {
        explanation = (await callAiExplanation(question.id)) ?? "Explicação indisponível.";
        if (explanation !== "Explicação indisponível.") {
          await prisma.questionExplanation.upsert({
            where: { question_id: question.id },
            create: { question_id: question.id, explanation },
            update: { explanation },
          });
        }
      }
      explanations[question.id] = {
        explanation,
        correct_answer: correctLetter(question) || null,
        user_answer: answer.selected_option,
        is_correct: Boolean(answer.is_correct),
        is_annulled: answer.is_annulled,
        subject: question.subject,
      };
    }
    const annulledIds = session.answers.filter((a) => a.is_annulled).map((a) => a.question_id);
    return reply.send({ review: { session_id: session.id, explanations, annulled_question_ids: annulledIds, annulled_questions_count: annulledIds.length } });
  });
}
