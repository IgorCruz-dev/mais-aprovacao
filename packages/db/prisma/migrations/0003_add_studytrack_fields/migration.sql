-- Rename ai_generated → is_ai_generated (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'ai_generated'
  ) THEN
    ALTER TABLE "questions" RENAME COLUMN "ai_generated" TO "is_ai_generated";
  END IF;
END $$;

-- Change difficulty to nullable text (StudyTrack uses Portuguese strings)
DO $$
DECLARE col_type TEXT;
BEGIN
  SELECT udt_name INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'questions' AND column_name = 'difficulty';

  IF col_type <> 'text' THEN
    ALTER TABLE "questions"
      ALTER COLUMN "difficulty" DROP DEFAULT,
      ALTER COLUMN "difficulty" TYPE text USING "difficulty"::text;
  END IF;
END $$;

ALTER TABLE "questions" ALTER COLUMN "difficulty" DROP NOT NULL;

-- Make images nullable
ALTER TABLE "questions" ALTER COLUMN "images" DROP NOT NULL;

-- Add StudyTrack-specific columns
ALTER TABLE "questions"
  ADD COLUMN IF NOT EXISTS "verified_by" uuid,
  ADD COLUMN IF NOT EXISTS "ai_reasoning" jsonb,
  ADD COLUMN IF NOT EXISTS "author_id" uuid,
  ADD COLUMN IF NOT EXISTS "testlet_group_id" uuid;

-- Drop old enum if it still exists
DROP TYPE IF EXISTS "QuestionDifficulty";
