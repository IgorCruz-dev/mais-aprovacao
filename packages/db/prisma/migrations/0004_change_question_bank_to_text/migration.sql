-- Change bank to free text (supports any vestibular, not just ENEM/UFU/UEG)
DO $$
DECLARE col_type TEXT;
BEGIN
  SELECT udt_name INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'questions' AND column_name = 'bank';

  IF col_type <> 'text' THEN
    ALTER TABLE "questions"
      ALTER COLUMN "bank" TYPE text USING "bank"::text;
  END IF;
END $$;

-- Drop old enum if it still exists
DROP TYPE IF EXISTS "QuestionBank";
