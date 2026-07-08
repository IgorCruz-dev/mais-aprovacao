import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Prisma } from "@mais-aprovacao/db";
import { prisma } from "../../lib/prisma.js";
import { logSecurityEvent, requireAuth, requireRole } from "../../plugins/auth.js";

const STUDENT_SELECT = { id: true, name: true, email: true, avatar_url: true } as const;

function serializeLink(link: {
  id: string;
  parent_user_id: string;
  student_user_id: string;
  verified: boolean;
  created_at: Date;
}) {
  return {
    id: link.id,
    parent_user_id: link.parent_user_id,
    student_user_id: link.student_user_id,
    verified: link.verified,
    created_at: link.created_at.toISOString(),
  };
}

const createLinkBody = z.object({
  student_email: z.string().email(),
});

async function handleCreateLink(req: FastifyRequest, reply: FastifyReply) {
  const parsed = createLinkBody.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid body", code: "VALIDATION_ERROR" });
  }

  // Email inexistente e usuário que não é aluno retornam a MESMA resposta —
  // não vazar qual dos dois casos ocorreu (anti-enumeração).
  const student = await prisma.user.findUnique({ where: { email: parsed.data.student_email } });
  if (!student || student.role !== "student") {
    return reply.status(404).send({ error: "Aluno não encontrado", code: "STUDENT_NOT_FOUND" });
  }

  try {
    const link = await prisma.parentStudentLink.create({
      data: { parent_user_id: req.user.id, student_user_id: student.id, verified: false },
    });

    await logSecurityEvent({
      user_id: req.user.id,
      event_type: "PARENT_LINK_CREATED",
      event_description: "Responsável solicitou vínculo com aluno (aguardando verificação).",
      metadata: { link_id: link.id, student_user_id: student.id },
    });

    return reply.status(201).send({ link: serializeLink(link) });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return reply.status(409).send({ error: "Vínculo já existe para este aluno", code: "LINK_ALREADY_EXISTS" });
    }
    throw err;
  }
}

async function handleStudentProgress(
  req: FastifyRequest<{ Params: { studentId: string }; Querystring: { course_id?: string } }>,
  reply: FastifyReply
) {
  const { studentId } = req.params;

  // Regra de ouro: a role autoriza o TIPO de acesso; a POSSE é revalidada na query.
  const link = await prisma.parentStudentLink.findUnique({
    where: {
      parent_user_id_student_user_id: {
        parent_user_id: req.user.id,
        student_user_id: studentId,
      },
    },
    include: { student: { select: { id: true, name: true } } },
  });

  if (!link) {
    return reply.status(404).send({ error: "Aluno não encontrado", code: "STUDENT_NOT_FOUND" });
  }
  if (!link.verified) {
    return reply.status(403).send({ error: "Vínculo aguardando verificação", code: "PARENT_LINK_NOT_VERIFIED" });
  }

  const courseFilter = req.query.course_id ? { course_id: req.query.course_id } : {};

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: studentId, ...courseFilter },
    include: { course: { select: { id: true, title: true } } },
  });

  const courseIds = enrollments.map((e) => e.course_id);

  const [lessonTotals, progressRows, pointsSum, streak] = await Promise.all([
    courseIds.length
      ? prisma.courseLesson.groupBy({
          by: ["course_id"],
          where: { course_id: { in: courseIds }, is_active: true },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    courseIds.length
      ? prisma.lessonProgress.groupBy({
          by: ["course_id"],
          where: { student_id: studentId, course_id: { in: courseIds } },
          _count: { _all: true },
          _sum: { watched_pct: true },
        })
      : Promise.resolve([]),
    prisma.gamificationPoint.aggregate({ _sum: { points: true }, where: { student_id: studentId } }),
    prisma.gamificationStreak.findUnique({ where: { student_id: studentId } }),
  ]);

  const completedByCourse = new Map<string, number>();
  if (courseIds.length) {
    const completed = await prisma.lessonProgress.groupBy({
      by: ["course_id"],
      where: { student_id: studentId, course_id: { in: courseIds }, completed: true },
      _count: { _all: true },
    });
    for (const row of completed) completedByCourse.set(row.course_id, row._count._all);
  }

  const totalsByCourse = new Map(lessonTotals.map((row) => [row.course_id, row._count._all]));
  const watchedSumByCourse = new Map(progressRows.map((row) => [row.course_id, row._sum.watched_pct ?? 0]));

  const courses = enrollments.map((enrollment) => {
    const total = totalsByCourse.get(enrollment.course_id) ?? 0;
    // Aulas sem registro de progresso contam como 0% na média.
    const watchedAvg = total > 0 ? Math.round((watchedSumByCourse.get(enrollment.course_id) ?? 0) / total) : 0;
    return {
      course_id: enrollment.course_id,
      course_title: enrollment.course.title,
      completed_lessons: completedByCourse.get(enrollment.course_id) ?? 0,
      total_lessons: total,
      watched_pct_avg: watchedAvg,
    };
  });

  return reply.send({
    student: { id: link.student.id, name: link.student.name },
    courses,
    gamification: {
      total_points: pointsSum._sum.points ?? 0,
      current_streak: streak?.current_streak ?? 0,
    },
  });
}

export async function parentRoutes(app: FastifyInstance) {
  const guard = [requireAuth, requireRole("parent")];

  app.get("/parent/student-links", { preHandler: guard }, async (req, reply) => {
    const links = await prisma.parentStudentLink.findMany({
      where: { parent_user_id: req.user.id },
      include: { student: { select: STUDENT_SELECT } },
      orderBy: { created_at: "desc" },
    });

    return reply.send({
      links: links.map((link) => ({ ...serializeLink(link), student: link.student })),
    });
  });

  app.post("/parent/student-links", { preHandler: guard }, handleCreateLink);

  app.get<{ Params: { studentId: string }; Querystring: { course_id?: string } }>(
    "/parent/students/:studentId/progress",
    { preHandler: guard },
    handleStudentProgress
  );
}
