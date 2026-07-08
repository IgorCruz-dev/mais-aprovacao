from pydantic import BaseModel


class QuestionExplanationResponse(BaseModel):
    question_id: str
    explanation: str
