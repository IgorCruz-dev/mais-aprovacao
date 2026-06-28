#!/usr/bin/env python3
import argparse
import math
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


QUESTIONS_BATCH_SIZE = 100
REPERTOIRE_BATCH_SIZE = 50

QUESTION_COLUMNS = (
    "external_id,exam_year,subject,discipline,bank,difficulty,title,context,"
    "alternatives_intro,alternatives,correct_alternative,images,is_verified,"
    "verified_by,ai_reasoning,is_public,author_id,testlet_group_id,"
    "is_ai_generated,status,metadata,created_at"
)

REPERTOIRE_COLUMNS = "id,content,author,category,embedding"


def load_environment():
    root_env = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(root_env)

    required = [
        "STUDYTRACK_SUPABASE_URL",
        "STUDYTRACK_SERVICE_ROLE_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
    ]
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        missing_names = ", ".join(missing)
        raise RuntimeError(f"Missing required environment variables: {missing_names}")


def get_clients():
    studytrack = create_client(
        os.environ["STUDYTRACK_SUPABASE_URL"],
        os.environ["STUDYTRACK_SERVICE_ROLE_KEY"],
    )
    apv = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )
    return studytrack, apv


def get_questions_count(studytrack):
    response = (
        studytrack.table("questions")
        .select("id", count="exact")
        .eq("is_verified", True)
        .eq("status", "active")
        .range(0, 0)
        .execute()
    )
    return response.count or 0


def get_repertoire_count(studytrack):
    response = (
        studytrack.table("repertoire")
        .select("id", count="exact")
        .range(0, 0)
        .execute()
    )
    return response.count or 0


def import_questions(studytrack, apv, dry_run=False):
    processed = 0
    errors = 0

    try:
        total = get_questions_count(studytrack)
    except Exception as exc:
        print(f"[questions] failed to count records: {exc}")
        return processed, errors + 1

    total_batches = math.ceil(total / QUESTIONS_BATCH_SIZE) if total else 0

    for batch_index in range(total_batches):
        start = batch_index * QUESTIONS_BATCH_SIZE
        end = start + QUESTIONS_BATCH_SIZE - 1

        try:
            response = (
                studytrack.table("questions")
                .select(QUESTION_COLUMNS)
                .eq("is_verified", True)
                .eq("status", "active")
                .order("external_id")
                .range(start, end)
                .execute()
            )
            records = response.data or []

            if dry_run:
                print(
                    f"[questions] batch {batch_index + 1}/{total_batches}: "
                    f"{len(records)} registros seriam enviados"
                )
            else:
                if records:
                    apv.table("questions").upsert(
                        records,
                        on_conflict="external_id",
                    ).execute()
                print(
                    f"[questions] batch {batch_index + 1}/{total_batches}: "
                    f"{len(records)} registros enviados"
                )

            processed += len(records)
        except Exception as exc:
            errors += 1
            print(f"[questions] batch {batch_index + 1}/{total_batches}: erro: {exc}")

    return processed, errors


def import_repertoire(studytrack, apv, dry_run=False):
    processed = 0
    errors = 0

    try:
        total = get_repertoire_count(studytrack)
    except Exception as exc:
        print(f"[repertoire] failed to count records: {exc}")
        return processed, errors + 1

    total_batches = math.ceil(total / REPERTOIRE_BATCH_SIZE) if total else 0

    for batch_index in range(total_batches):
        start = batch_index * REPERTOIRE_BATCH_SIZE
        end = start + REPERTOIRE_BATCH_SIZE - 1

        try:
            response = (
                studytrack.table("repertoire")
                .select(REPERTOIRE_COLUMNS)
                .order("id")
                .range(start, end)
                .execute()
            )
            records = response.data or []

            if dry_run:
                print(
                    f"[repertoire] batch {batch_index + 1}/{total_batches}: "
                    f"{len(records)} registros seriam enviados"
                )
            else:
                if records:
                    apv.table("repertoire").upsert(
                        records,
                        on_conflict="id",
                    ).execute()
                print(
                    f"[repertoire] batch {batch_index + 1}/{total_batches}: "
                    f"{len(records)} registros enviados"
                )

            processed += len(records)
        except Exception as exc:
            errors += 1
            print(f"[repertoire] batch {batch_index + 1}/{total_batches}: erro: {exc}")

    return processed, errors


def parse_args():
    parser = argparse.ArgumentParser(
        description="Import StudyTrack Supabase data into the +Aprovacao Supabase database."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Read and report batches without writing to the APV database.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    load_environment()
    studytrack, apv = get_clients()

    if args.dry_run:
        print("Dry-run enabled: no data will be written.")

    questions_processed, question_errors = import_questions(
        studytrack,
        apv,
        dry_run=args.dry_run,
    )
    repertoire_processed, repertoire_errors = import_repertoire(
        studytrack,
        apv,
        dry_run=args.dry_run,
    )

    errors = question_errors + repertoire_errors
    print("")
    print("Import summary")
    print(f"- questions processed: {questions_processed}")
    print(f"- repertoire processed: {repertoire_processed}")
    print(f"- errors: {errors}")


if __name__ == "__main__":
    main()
