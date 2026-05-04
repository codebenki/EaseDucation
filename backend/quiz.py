from pydantic import BaseModel, Field
from typing import List

class QuizQuestion(BaseModel):
    # id: str = Field(..., description="Unique ID for the question")
    text: str = Field(..., description="The question content")
    options: List[str] = Field(..., description="Exactly 4 multiple choice options")
    correct_idx: int = Field(..., description="Index (0-3) of the correct answer")
    explanation: str = Field(..., description="Why this answer is correct")

class QuizSchema(BaseModel):
    title: str = Field(..., description="Subject of the quiz")
    questions: List[QuizQuestion] = Field(..., description="List of 5 questions")