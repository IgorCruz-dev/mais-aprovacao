import os

from fastapi import Header, HTTPException


def verify_ai_secret(x_ai_secret: str | None = Header(default=None, alias="X-AI-Secret")) -> None:
    expected = os.getenv("AI_SERVICE_SECRET")
    if expected and x_ai_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid AI service secret")
