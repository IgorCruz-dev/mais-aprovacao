-- Enums novos.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'UserRole') THEN
    CREATE TYPE public."UserRole" AS ENUM ('student', 'teacher', 'manager', 'parent', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'LessonStatus') THEN
    CREATE TYPE public."LessonStatus" AS ENUM ('pending', 'processing', 'ready', 'error');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'QuestionDifficulty') THEN
    CREATE TYPE public."QuestionDifficulty" AS ENUM ('easy', 'medium', 'hard');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'PaymentStatus') THEN
    CREATE TYPE public."PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'ExamSessionStatus') THEN
    CREATE TYPE public."ExamSessionStatus" AS ENUM ('in_progress', 'completed', 'abandoned');
  END IF;
END $$;

-- Enums existentes no banco atual.
ALTER TYPE public."LiveClassStatus" ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE public."EssayStatus" ADD VALUE IF NOT EXISTS 'transcribing';
ALTER TYPE public."EssayStatus" ADD VALUE IF NOT EXISTS 'correcting';
ALTER TYPE public."EssayStatus" ADD VALUE IF NOT EXISTS 'error';
ALTER TYPE public."EssayType" ADD VALUE IF NOT EXISTS 'fuvest';
ALTER TYPE public."EssayType" ADD VALUE IF NOT EXISTS 'vunesp';

-- Usuario espelho do Clerk.
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role public."UserRole" NOT NULL DEFAULT 'student',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ajustes em tabelas existentes.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS teacher_id uuid;

ALTER TABLE public.course_lessons
  ADD COLUMN IF NOT EXISTS status public."LessonStatus" NOT NULL DEFAULT 'pending';

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS watched_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS credential_id uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.live_classes
  ADD COLUMN IF NOT EXISTS teacher_id uuid,
  ADD COLUMN IF NOT EXISTS ivs_channel_arn text,
  ADD COLUMN IF NOT EXISTS ivs_ingest_endpoint text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS generation_prompt text;

DO $$
DECLARE
  difficulty_type text;
BEGIN
  SELECT udt_name
    INTO difficulty_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'questions'
    AND column_name = 'difficulty';

  IF difficulty_type IS NULL THEN
    ALTER TABLE public.questions
      ADD COLUMN difficulty public."QuestionDifficulty" NOT NULL DEFAULT 'medium';
  ELSIF difficulty_type <> 'QuestionDifficulty' THEN
    ALTER TABLE public.questions ALTER COLUMN difficulty DROP DEFAULT;

    UPDATE public.questions
       SET difficulty = 'medium'
     WHERE difficulty IS NULL
        OR lower(difficulty::text) NOT IN ('easy', 'medium', 'hard');

    ALTER TABLE public.questions
      ALTER COLUMN difficulty TYPE public."QuestionDifficulty"
      USING lower(difficulty::text)::public."QuestionDifficulty";

    ALTER TABLE public.questions
      ALTER COLUMN difficulty SET DEFAULT 'medium',
      ALTER COLUMN difficulty SET NOT NULL;
  ELSE
    UPDATE public.questions SET difficulty = 'medium' WHERE difficulty IS NULL;
    ALTER TABLE public.questions
      ALTER COLUMN difficulty SET DEFAULT 'medium',
      ALTER COLUMN difficulty SET NOT NULL;
  END IF;
END $$;

UPDATE public.questions SET images = ARRAY[]::text[] WHERE images IS NULL;
ALTER TABLE public.questions
  ALTER COLUMN images SET DEFAULT ARRAY[]::text[],
  ALTER COLUMN images SET NOT NULL;

ALTER TABLE public.essays
  ADD COLUMN IF NOT EXISTS prompt_id uuid,
  ADD COLUMN IF NOT EXISTS transcribed_text text;

ALTER TABLE public.essays
  ALTER COLUMN text DROP NOT NULL;

-- Tabelas novas.
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status public."PaymentStatus" NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.essay_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  support_items jsonb,
  essay_type public."EssayType" NOT NULL DEFAULT 'enem',
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  UNIQUE (session_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  created_by uuid NOT NULL,
  question text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL,
  text text NOT NULL,
  "order" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL,
  option_id uuid NOT NULL,
  student_id uuid NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  question_id uuid NOT NULL,
  selected_option text NOT NULL,
  is_correct boolean NOT NULL,
  time_spent_ms integer,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid,
  status public."ExamSessionStatus" NOT NULL DEFAULT 'in_progress',
  total_questions integer NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  score double precision,
  is_printed boolean NOT NULL DEFAULT false,
  answer_sheet_image_url text,
  ocr_status text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_session_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  question_id uuid NOT NULL,
  selected_option text,
  is_correct boolean,
  answered_at timestamptz,
  UNIQUE (session_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL,
  student_user_id uuid NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_user_id, student_user_id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid,
  created_by uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, event_id)
);

CREATE TABLE IF NOT EXISTS public.gamification_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  points integer NOT NULL,
  origin_type text NOT NULL,
  origin_id uuid,
  multiplier double precision NOT NULL DEFAULT 1.0,
  earned_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gamification_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  shield_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gamification_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  title_key text NOT NULL,
  title_name text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, title_key)
);

CREATE TABLE IF NOT EXISTS public.gamification_monthly_ranking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  month text NOT NULL,
  total_points integer NOT NULL,
  rank integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, month)
);

-- Constraints idempotentes.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_teacher_id_fkey' AND conrelid = 'public.courses'::regclass) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_student_id_fkey' AND conrelid = 'public.enrollments'::regclass) THEN
    ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_progress_student_id_fkey' AND conrelid = 'public.lesson_progress'::regclass) THEN
    ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'module_completions_student_id_fkey' AND conrelid = 'public.module_completions'::regclass) THEN
    ALTER TABLE public.module_completions ADD CONSTRAINT module_completions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificates_student_id_fkey' AND conrelid = 'public.certificates'::regclass) THEN
    ALTER TABLE public.certificates ADD CONSTRAINT certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificates_course_id_fkey' AND conrelid = 'public.certificates'::regclass) THEN
    ALTER TABLE public.certificates ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'live_classes_teacher_id_fkey' AND conrelid = 'public.live_classes'::regclass) THEN
    ALTER TABLE public.live_classes ADD CONSTRAINT live_classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_student_id_fkey' AND conrelid = 'public.payments'::regclass) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_course_id_fkey' AND conrelid = 'public.payments'::regclass) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'essay_prompts_course_id_fkey' AND conrelid = 'public.essay_prompts'::regclass) THEN
    ALTER TABLE public.essay_prompts ADD CONSTRAINT essay_prompts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'essays_student_id_fkey' AND conrelid = 'public.essays'::regclass) THEN
    ALTER TABLE public.essays ADD CONSTRAINT essays_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'essays_prompt_id_fkey' AND conrelid = 'public.essays'::regclass) THEN
    ALTER TABLE public.essays ADD CONSTRAINT essays_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.essay_prompts(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'live_attendance_session_id_fkey' AND conrelid = 'public.live_attendance'::regclass) THEN
    ALTER TABLE public.live_attendance ADD CONSTRAINT live_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.live_classes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'live_attendance_student_id_fkey' AND conrelid = 'public.live_attendance'::regclass) THEN
    ALTER TABLE public.live_attendance ADD CONSTRAINT live_attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'polls_session_id_fkey' AND conrelid = 'public.polls'::regclass) THEN
    ALTER TABLE public.polls ADD CONSTRAINT polls_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.live_classes(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'polls_created_by_fkey' AND conrelid = 'public.polls'::regclass) THEN
    ALTER TABLE public.polls ADD CONSTRAINT polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'poll_options_poll_id_fkey' AND conrelid = 'public.poll_options'::regclass) THEN
    ALTER TABLE public.poll_options ADD CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'poll_votes_poll_id_fkey' AND conrelid = 'public.poll_votes'::regclass) THEN
    ALTER TABLE public.poll_votes ADD CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'poll_votes_student_id_fkey' AND conrelid = 'public.poll_votes'::regclass) THEN
    ALTER TABLE public.poll_votes ADD CONSTRAINT poll_votes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_attempts_student_id_fkey' AND conrelid = 'public.question_attempts'::regclass) THEN
    ALTER TABLE public.question_attempts ADD CONSTRAINT question_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'question_attempts_question_id_fkey' AND conrelid = 'public.question_attempts'::regclass) THEN
    ALTER TABLE public.question_attempts ADD CONSTRAINT question_attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exam_sessions_student_id_fkey' AND conrelid = 'public.exam_sessions'::regclass) THEN
    ALTER TABLE public.exam_sessions ADD CONSTRAINT exam_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exam_sessions_course_id_fkey' AND conrelid = 'public.exam_sessions'::regclass) THEN
    ALTER TABLE public.exam_sessions ADD CONSTRAINT exam_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exam_session_answers_session_id_fkey' AND conrelid = 'public.exam_session_answers'::regclass) THEN
    ALTER TABLE public.exam_session_answers ADD CONSTRAINT exam_session_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.exam_sessions(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exam_session_answers_question_id_fkey' AND conrelid = 'public.exam_session_answers'::regclass) THEN
    ALTER TABLE public.exam_session_answers ADD CONSTRAINT exam_session_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'parent_student_links_parent_user_id_fkey' AND conrelid = 'public.parent_student_links'::regclass) THEN
    ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'parent_student_links_student_user_id_fkey' AND conrelid = 'public.parent_student_links'::regclass) THEN
    ALTER TABLE public.parent_student_links ADD CONSTRAINT parent_student_links_student_user_id_fkey FOREIGN KEY (student_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_course_id_fkey' AND conrelid = 'public.announcements'::regclass) THEN
    ALTER TABLE public.announcements ADD CONSTRAINT announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_created_by_fkey' AND conrelid = 'public.announcements'::regclass) THEN
    ALTER TABLE public.announcements ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gamification_points_student_id_fkey' AND conrelid = 'public.gamification_points'::regclass) THEN
    ALTER TABLE public.gamification_points ADD CONSTRAINT gamification_points_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gamification_streaks_student_id_fkey' AND conrelid = 'public.gamification_streaks'::regclass) THEN
    ALTER TABLE public.gamification_streaks ADD CONSTRAINT gamification_streaks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gamification_titles_student_id_fkey' AND conrelid = 'public.gamification_titles'::regclass) THEN
    ALTER TABLE public.gamification_titles ADD CONSTRAINT gamification_titles_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gamification_monthly_ranking_student_id_fkey' AND conrelid = 'public.gamification_monthly_ranking'::regclass) THEN
    ALTER TABLE public.gamification_monthly_ranking ADD CONSTRAINT gamification_monthly_ranking_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS certificates_credential_id_key ON public.certificates (credential_id);

CREATE INDEX IF NOT EXISTS questions_subject_discipline_idx ON public.questions (subject, discipline);
CREATE INDEX IF NOT EXISTS questions_bank_idx ON public.questions (bank);
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS questions_status_is_verified_idx ON public.questions (status, is_verified);

CREATE INDEX IF NOT EXISTS question_attempts_student_id_attempted_at_idx ON public.question_attempts (student_id, attempted_at);
CREATE INDEX IF NOT EXISTS gamification_points_student_id_earned_at_idx ON public.gamification_points (student_id, earned_at);
CREATE INDEX IF NOT EXISTS gamification_monthly_ranking_month_total_points_idx ON public.gamification_monthly_ranking (month, total_points);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertoire ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_competency_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_monthly_ranking ENABLE ROW LEVEL SECURITY;


-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "module_completions" ADD CONSTRAINT "module_completions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "essays" ADD CONSTRAINT "essays_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "poll_options_id_poll_id_key" ON "poll_options"("id", "poll_id");

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_id_fkey" FOREIGN KEY ("option_id", "poll_id") REFERENCES "poll_options"("id", "poll_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "course_materials" ADD CONSTRAINT "course_materials_exactly_one_parent_check" CHECK (num_nonnulls("lesson_id", "module_id") = 1);

-- CreatePolicy
CREATE POLICY "student_own_data"
ON "enrollments"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "enrollments"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_own_data"
ON "lesson_progress"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "lesson_progress"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_own_data"
ON "module_completions"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "module_completions"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_own_data"
ON "certificates"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "certificates"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "public_read_active_courses"
ON "courses"
FOR SELECT
USING ("is_active" = true);

CREATE POLICY "public_read_active_course_cohorts"
ON "course_cohorts"
FOR SELECT
USING (
  "is_active" = true
  AND EXISTS (
    SELECT 1
    FROM "courses"
    WHERE "courses"."id" = "course_cohorts"."course_id"
      AND "courses"."is_active" = true
  )
);

CREATE POLICY "public_read_active_course_modules"
ON "course_modules"
FOR SELECT
USING (
  "is_active" = true
  AND EXISTS (
    SELECT 1
    FROM "courses"
    WHERE "courses"."id" = "course_modules"."course_id"
      AND "courses"."is_active" = true
  )
);

CREATE POLICY "public_read_released_course_lessons"
ON "course_lessons"
FOR SELECT
USING (
  "is_active" = true
  AND ("released_at" IS NULL OR "released_at" <= now())
  AND EXISTS (
    SELECT 1
    FROM "courses"
    WHERE "courses"."id" = "course_lessons"."course_id"
      AND "courses"."is_active" = true
  )
);

CREATE POLICY "public_read_course_materials"
ON "course_materials"
FOR SELECT
USING (
  (
    "lesson_id" IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM "course_lessons"
      JOIN "courses" ON "courses"."id" = "course_lessons"."course_id"
      WHERE "course_lessons"."id" = "course_materials"."lesson_id"
        AND "course_lessons"."is_active" = true
        AND ("course_lessons"."released_at" IS NULL OR "course_lessons"."released_at" <= now())
        AND "courses"."is_active" = true
    )
  )
  OR (
    "module_id" IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM "course_modules"
      JOIN "courses" ON "courses"."id" = "course_modules"."course_id"
      WHERE "course_modules"."id" = "course_materials"."module_id"
        AND "course_modules"."is_active" = true
        AND "courses"."is_active" = true
    )
  )
);

CREATE POLICY "student_read_own_checkout_sessions"
ON "checkout_sessions"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "checkout_sessions"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "public_read_live_classes"
ON "live_classes"
FOR SELECT
USING (
  "status" IN ('scheduled', 'live', 'ended')
  AND (
    "course_id" IS NULL
    OR EXISTS (
      SELECT 1
      FROM "courses"
      WHERE "courses"."id" = "live_classes"."course_id"
        AND "courses"."is_active" = true
    )
  )
);

CREATE POLICY "public_read_verified_questions"
ON "questions"
FOR SELECT
USING (
  "status" = 'active'
  AND "is_verified" = true
  AND "is_public" = true
);

CREATE POLICY "public_read_repertoire"
ON "repertoire"
FOR SELECT
USING (true);

CREATE POLICY "student_read_own_essays"
ON "essays"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "essays"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_essay_competency_scores"
ON "essay_competency_scores"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "essays"
    JOIN "users" ON "users"."id" = "essays"."student_id"
    WHERE "essays"."id" = "essay_competency_scores"."essay_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_profile"
ON "users"
FOR SELECT
USING ("clerk_id" = auth.jwt()->>'sub');

CREATE POLICY "student_read_own_payments"
ON "payments"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "payments"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "public_read_active_essay_prompts"
ON "essay_prompts"
FOR SELECT
USING (
  "is_active" = true
  AND ("starts_at" IS NULL OR "starts_at" <= now())
  AND ("ends_at" IS NULL OR "ends_at" >= now())
  AND EXISTS (
    SELECT 1
    FROM "courses"
    WHERE "courses"."id" = "essay_prompts"."course_id"
      AND "courses"."is_active" = true
  )
);

CREATE POLICY "student_read_own_live_attendance"
ON "live_attendance"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "live_attendance"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_insert_own_live_attendance"
ON "live_attendance"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "live_attendance"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_update_own_live_attendance"
ON "live_attendance"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "live_attendance"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "live_attendance"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "public_read_active_polls"
ON "polls"
FOR SELECT
USING (
  "is_active" = true
  AND EXISTS (
    SELECT 1
    FROM "live_classes"
    WHERE "live_classes"."id" = "polls"."session_id"
      AND "live_classes"."status" = 'live'
      AND (
        "live_classes"."course_id" IS NULL
        OR EXISTS (
          SELECT 1
          FROM "courses"
          WHERE "courses"."id" = "live_classes"."course_id"
            AND "courses"."is_active" = true
        )
      )
  )
);

CREATE POLICY "public_read_poll_options"
ON "poll_options"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "polls"
    JOIN "live_classes" ON "live_classes"."id" = "polls"."session_id"
    WHERE "polls"."id" = "poll_options"."poll_id"
      AND "polls"."is_active" = true
      AND "live_classes"."status" = 'live'
      AND (
        "live_classes"."course_id" IS NULL
        OR EXISTS (
          SELECT 1
          FROM "courses"
          WHERE "courses"."id" = "live_classes"."course_id"
            AND "courses"."is_active" = true
        )
      )
  )
);

CREATE POLICY "student_read_own_poll_votes"
ON "poll_votes"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "poll_votes"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_insert_own_poll_votes"
ON "poll_votes"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "poll_votes"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
  AND EXISTS (
    SELECT 1
    FROM "poll_options"
    JOIN "polls" ON "polls"."id" = "poll_options"."poll_id"
    JOIN "live_classes" ON "live_classes"."id" = "polls"."session_id"
    WHERE "poll_options"."id" = "poll_votes"."option_id"
      AND "poll_options"."poll_id" = "poll_votes"."poll_id"
      AND "polls"."is_active" = true
      AND "live_classes"."status" = 'live'
      AND (
        "live_classes"."course_id" IS NULL
        OR EXISTS (
          SELECT 1
          FROM "courses"
          WHERE "courses"."id" = "live_classes"."course_id"
            AND "courses"."is_active" = true
        )
      )
  )
);

CREATE POLICY "student_read_own_question_attempts"
ON "question_attempts"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "question_attempts"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_insert_own_question_attempts"
ON "question_attempts"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "question_attempts"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_exam_sessions"
ON "exam_sessions"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "exam_sessions"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_insert_own_exam_sessions"
ON "exam_sessions"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "exam_sessions"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_update_own_exam_sessions"
ON "exam_sessions"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "exam_sessions"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "exam_sessions"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_exam_session_answers"
ON "exam_session_answers"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "exam_sessions"
    JOIN "users" ON "users"."id" = "exam_sessions"."student_id"
    WHERE "exam_sessions"."id" = "exam_session_answers"."session_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_insert_own_exam_session_answers"
ON "exam_session_answers"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "exam_sessions"
    JOIN "users" ON "users"."id" = "exam_sessions"."student_id"
    WHERE "exam_sessions"."id" = "exam_session_answers"."session_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_update_own_exam_session_answers"
ON "exam_session_answers"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM "exam_sessions"
    JOIN "users" ON "users"."id" = "exam_sessions"."student_id"
    WHERE "exam_sessions"."id" = "exam_session_answers"."session_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "exam_sessions"
    JOIN "users" ON "users"."id" = "exam_sessions"."student_id"
    WHERE "exam_sessions"."id" = "exam_session_answers"."session_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "user_read_own_parent_student_links"
ON "parent_student_links"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" IN (
      "parent_student_links"."parent_user_id",
      "parent_student_links"."student_user_id"
    )
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "public_read_published_announcements"
ON "announcements"
FOR SELECT
USING (
  "published_at" <= now()
  AND (
    "course_id" IS NULL
    OR EXISTS (
      SELECT 1
      FROM "courses"
      WHERE "courses"."id" = "announcements"."course_id"
        AND "courses"."is_active" = true
    )
  )
);

CREATE POLICY "student_read_own_gamification_points"
ON "gamification_points"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "gamification_points"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_gamification_streaks"
ON "gamification_streaks"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "gamification_streaks"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "student_read_own_gamification_titles"
ON "gamification_titles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = "gamification_titles"."student_id"
      AND "users"."clerk_id" = auth.jwt()->>'sub'
  )
);

CREATE POLICY "public_read_gamification_monthly_ranking"
ON "gamification_monthly_ranking"
FOR SELECT
USING (true);
