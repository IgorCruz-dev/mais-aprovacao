from pydantic import BaseModel
from typing import Optional


class EssaySubmit(BaseModel):
    student_id: str
    text: str
    theme: Optional[str] = None
    essay_type: str = "enem"


class CompetencyScore(BaseModel):
    competency: int
    score: int
    comment: Optional[str] = None


class EssayResult(BaseModel):
    essay_id: str
    total_score: int
    general_comment: str
    competency_scores: list[CompetencyScore]
