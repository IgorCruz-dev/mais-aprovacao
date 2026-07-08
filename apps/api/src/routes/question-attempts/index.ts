import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../plugins/clerk.js";
import {
  getCurrentUser,
  getQuestionExplanation,
  normalizeSelectedOption,
  requireStudentAccess,
  type QuestionRow,
} from "../questions/shared.js";

const attemptBody = z.object({
  question_id: z.string().uuid(),
  selected_option: z.string().min(1),
  time_spent_ms: z.number().int().positive().optional(),
});

function correctAlternativeFromQuestion(question: QuestionRow): string | null {
  const direct = String(question.correct_alternative ?? "").trim().toUpperCase();
  if (direct) return direct;

  const alternatives = question.alternatives;
  if (!Array.isArray(alternatives)) return null;
  for (const item of alternatives) {
    if (!item || typeof item !== "object") continue;
    const alt = item as Record<string, unknown>;
    if (alt.isCorrect || alt.correct) {
      return String(alt.letter ?? alt.label ?? "").trim().toUpperCase() || null;
    }
  }
  return null;
}

function todayUtcDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function questionAttemptRoutes(app: FastifyInstance) {
  app.post("/question-attempts", { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = attemptBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
    }

    const selectedOption = normalizeSelectedOption(parsed.data.selected_option);
    if (!selectedOption) {
      return reply.status(400).send({ error: "Invalid selected option", code: "VALIDATION_ERROR" });
    }

    const user = await getCurrentUser(req, reply);
    if (!user) return;
    if (!(await requireStudentAccess(user.id, reply))) return;

    const question = await prisma.question.findFirst({
      where: { id: parsed.data.question_id, is_verified: true },
    });
    if (!question) {
      return reply.status(404).send({ error: "Question not found", code: "QUESTION_NOT_FOUND" });
    }

    const questionRow = question as QuestionRow;
    const correctAlternative = correctAlternativeFromQuestion(questionRow);
    if (!correctAlternative) {
      return reply.status(409).send({ error: "Question is not available", code: "QUESTION_NOT_AVAILABLE" });
    }

    const isCorrect = selectedOption === correctAlternative;
    const alreadyCorrect = await prisma.questionAttempt.findFirst({
      where: { student_id: user.id, question_id: question.id, is_correct: true },
      select: { id: true },
    });
    const isFirstCorrect = isCorrect && !alreadyCorrect;
    const pointsAwarded = isFirstCorrect ? 3 : 0;

    const attempt = await prisma.$transaction(async (tx) => {
      const created = await tx.questionAttempt.create({
        data: {
          student_id: user.id,
          question_id: question.id,
          selected_option: selectedOption,
          is_correct: isCorrect,
          is_first_correct: isFirstCorrect,
          subject: question.subject,
          time_spent_ms: parsed.data.time_spent_ms ?? null,
        },
      });

      await tx.dailyUsage.upsert({
        where: {
          student_id_usage_date: {
            student_id: user.id,
            usage_date: todayUtcDate(),
          },
        },
        create: {
          student_id: user.id,
          usage_date: todayUtcDate(),
          questions_count: 1,
          simulations_count: 0,
        },
        update: {
          questions_count: { increment: 1 },
        },
      });

      if (pointsAwarded > 0) {
        await tx.gamificationPoint.create({
          data: {
            student_id: user.id,
            points: pointsAwarded,
            origin_type: "question_attempt",
            origin_id: created.id,
          },
        });
      }

      return created;
    });

    return reply.status(201).send({
      attempt: {
        id: attempt.id,
        question_id: attempt.question_id,
        selected_option: attempt.selected_option,
        is_correct: attempt.is_correct,
        is_first_correct: attempt.is_first_correct,
        already_answered_correctly: Boolean(alreadyCorrect),
        correct_alternative: correctAlternative,
        explanation: getQuestionExplanation(questionRow),
        time_spent_ms: attempt.time_spent_ms,
        attempted_at: attempt.attempted_at.toISOString(),
        points_awarded: pointsAwarded,
      },
    });
  });
}
