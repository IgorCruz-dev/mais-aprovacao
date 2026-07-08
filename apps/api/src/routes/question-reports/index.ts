import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "@mais-aprovacao/db";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../plugins/clerk.js";
import { getCurrentUser, parseLimit, requireStudentAccess } from "../questions/shared.js";

const createBody = z.object({
  question_id: z.string().uuid(),
  error_category: z.enum(["estrutural", "conteudo", "resposta", "outro"]),
  description: z.string().max(2000).optional().nullable(),
});

export async function questionReportRoutes(app: FastifyInstance) {
  app.post("/question-reports", { preHandler: [requireAuth] }, async (req, reply) => {
    const parsed = createBody.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    if (!(await requireStudentAccess(user.id, reply))) return;

    const question = await prisma.question.findFirst({
      where: { id: parsed.data.question_id, is_verified: true },
      select: { id: true },
    });
    if (!question) return reply.status(404).send({ error: "Question not found", code: "QUESTION_NOT_FOUND" });

    try {
      const report = await prisma.questionReport.create({
        data: {
          question_id: parsed.data.question_id,
          student_id: user.id,
          error_category: parsed.data.error_category,
          description: parsed.data.description?.trim() || null,
        },
      });
      return reply.status(201).send({
        report: {
          id: report.id,
          question_id: report.question_id,
          error_category: report.error_category,
          description: report.description,
          status: report.status,
          created_at: report.created_at.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return reply.status(409).send({ error: "Question report already open", code: "QUESTION_REPORT_ALREADY_OPEN" });
      }
      throw error;
    }
  });

  app.get("/question-reports/me", { preHandler: [requireAuth] }, async (req, reply) => {
    const query = z.object({ limit: z.coerce.number().optional(), cursor: z.string().optional() }).safeParse(req.query);
    if (!query.success) return reply.status(400).send({ error: "Invalid query", code: "VALIDATION_ERROR" });
    const user = await getCurrentUser(req, reply);
    if (!user) return;
    const limit = parseLimit(query.data.limit);
    const cursorDate = query.data.cursor ? new Date(query.data.cursor) : null;
    const reports = await prisma.questionReport.findMany({
      where: {
        student_id: user.id,
        ...(cursorDate && !Number.isNaN(cursorDate.getTime()) ? { created_at: { lt: cursorDate } } : {}),
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    });
    const page = reports.slice(0, limit);
    return reply.send({
      reports: page.map((report) => ({
        id: report.id,
        question_id: report.question_id,
        error_category: report.error_category,
        description: report.description,
        status: report.status,
        created_at: report.created_at.toISOString(),
        resolved_at: report.resolved_at?.toISOString() ?? null,
      })),
      next_cursor: reports.length > limit ? page.at(-1)?.created_at.toISOString() ?? null : null,
    });
  });
}
