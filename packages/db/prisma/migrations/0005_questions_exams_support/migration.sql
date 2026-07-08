-- Support tables and fields for Banco de Questões and Simulados.
-- The questions table is not structurally changed here; only indexes are added.

CREATE TYPE "question_report_error_category" AS ENUM ('estrutural', 'conteudo', 'resposta', 'outro');
CREATE TYPE "question_report_status" AS ENUM ('pending', 'reviewing', 'resolved');

ALTER TABLE "question_attempts"
  ADD COLUMN IF NOT EXISTS "is_first_correct" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "subject" text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'question_attempts_student_id_fkey'
      AND conrelid = 'public.question_attempts'::regclass
  ) THEN
    ALTER TABLE public.question_attempts DROP CONSTRAINT question_attempts_student_id_fkey;
  END IF;
  ALTER TABLE public.question_attempts
    ADD CONSTRAINT question_attempts_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'question_attempts_question_id_fkey'
      AND conrelid = 'public.question_attempts'::regclass
  ) THEN
    ALTER TABLE public.question_attempts DROP CONSTRAINT question_attempts_question_id_fkey;
  END IF;
  ALTER TABLE public.question_attempts
    ADD CONSTRAINT question_attempts_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;
END $$;

ALTER TABLE "exam_sessions"
  ADD COLUMN IF NOT EXISTS "config" jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "question_ids" uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "time_taken_secs" integer,
  ADD COLUMN IF NOT EXISTS "tri_score" numeric(5,1),
  ADD COLUMN IF NOT EXISTS "results_by_subject" jsonb NOT NULL DEFAULT '{}';

ALTER TABLE "exam_sessions"
  ALTER COLUMN "total_questions" DROP NOT NULL,
  ALTER COLUMN "correct_count" DROP DEFAULT,
  ALTER COLUMN "correct_count" DROP NOT NULL;

ALTER TABLE "exam_sessions"
  ALTER COLUMN "score" TYPE integer USING CASE
    WHEN "score" IS NULL THEN NULL
    ELSE round("score")::integer
  END;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'exam_sessions_student_id_fkey'
      AND conrelid = 'public.exam_sessions'::regclass
  ) THEN
    ALTER TABLE public.exam_sessions DROP CONSTRAINT exam_sessions_student_id_fkey;
  END IF;
  ALTER TABLE public.exam_sessions
    ADD CONSTRAINT exam_sessions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'exam_sessions_status_check'
      AND conrelid = 'public.exam_sessions'::regclass
  ) THEN
    ALTER TABLE public.exam_sessions
      ADD CONSTRAINT exam_sessions_status_check
      CHECK (status::text IN ('in_progress', 'completed', 'abandoned'));
  END IF;
END $$;

ALTER TABLE "exam_session_answers"
  ADD COLUMN IF NOT EXISTS "order_index" integer,
  ADD COLUMN IF NOT EXISTS "is_annulled" boolean NOT NULL DEFAULT false;

WITH ordered AS (
  SELECT id, row_number() OVER (PARTITION BY session_id ORDER BY answered_at NULLS LAST, id) - 1 AS rn
  FROM exam_session_answers
  WHERE order_index IS NULL
)
UPDATE exam_session_answers a
SET order_index = ordered.rn
FROM ordered
WHERE a.id = ordered.id;

ALTER TABLE "exam_session_answers"
  ALTER COLUMN "order_index" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "daily_usage" (
  "student_id" uuid NOT NULL,
  "usage_date" date NOT NULL DEFAULT CURRENT_DATE,
  "questions_count" integer NOT NULL DEFAULT 0,
  "simulations_count" integer NOT NULL DEFAULT 0,
  CONSTRAINT "daily_usage_pkey" PRIMARY KEY ("student_id", "usage_date"),
  CONSTRAINT "daily_usage_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "question_reports" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "question_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "error_category" "question_report_error_category" NOT NULL,
  "description" text,
  "status" "question_report_status" NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "resolved_at" timestamptz,
  "resolved_by" uuid,
  CONSTRAINT "question_reports_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "question_reports_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE,
  CONSTRAINT "question_reports_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "question_reports_resolved_by_fkey"
    FOREIGN KEY ("resolved_by") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "question_explanations" (
  "question_id" uuid NOT NULL,
  "explanation" text NOT NULL,
  "generated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "question_explanations_pkey" PRIMARY KEY ("question_id"),
  CONSTRAINT "question_explanations_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "question_attempts_student_id_question_id_idx"
  ON "question_attempts" ("student_id", "question_id");
CREATE INDEX IF NOT EXISTS "question_attempts_student_id_attempted_at_desc_idx"
  ON "question_attempts" ("student_id", "attempted_at" DESC);
CREATE INDEX IF NOT EXISTS "question_attempts_question_id_idx"
  ON "question_attempts" ("question_id");

CREATE INDEX IF NOT EXISTS "exam_sessions_student_id_status_idx"
  ON "exam_sessions" ("student_id", "status");
CREATE INDEX IF NOT EXISTS "exam_sessions_student_id_started_at_desc_idx"
  ON "exam_sessions" ("student_id", "started_at" DESC);
CREATE INDEX IF NOT EXISTS "exam_sessions_status_idx"
  ON "exam_sessions" ("status");
CREATE INDEX IF NOT EXISTS "exam_session_answers_session_id_order_index_idx"
  ON "exam_session_answers" ("session_id", "order_index");

CREATE INDEX IF NOT EXISTS "question_reports_question_id_idx"
  ON "question_reports" ("question_id");
CREATE INDEX IF NOT EXISTS "question_reports_student_id_idx"
  ON "question_reports" ("student_id");
CREATE INDEX IF NOT EXISTS "question_reports_status_idx"
  ON "question_reports" ("status");
CREATE INDEX IF NOT EXISTS "question_reports_created_at_desc_idx"
  ON "question_reports" ("created_at" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS "question_reports_student_question_open_idx"
  ON "question_reports" ("student_id", "question_id")
  WHERE "status" IN ('pending', 'reviewing');

CREATE INDEX IF NOT EXISTS "questions_metadata_gin_idx"
  ON "questions" USING gin ("metadata");
CREATE INDEX IF NOT EXISTS "questions_external_id_idx"
  ON "questions" ("external_id");
CREATE INDEX IF NOT EXISTS "questions_is_verified_subject_idx"
  ON "questions" ("is_verified", "subject");

ALTER TABLE "daily_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_explanations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_read_own_daily_usage"
ON "daily_usage"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "users"
    WHERE "users"."id" = "daily_usage"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_question_reports"
ON "question_reports"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "users"
    WHERE "users"."id" = "question_reports"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_insert_own_question_reports"
ON "question_reports"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "users"
    WHERE "users"."id" = "question_reports"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "authenticated_read_question_explanations"
ON "question_explanations"
FOR SELECT
USING (auth.role() = 'authenticated');
