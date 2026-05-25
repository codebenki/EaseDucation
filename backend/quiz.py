from pydantic import BaseModel, Field
from typing import List
from use_supabase import use_supabase

supabase = use_supabase()

class QuizQuestion(BaseModel):
    # id: str = Field(..., description="Unique ID for the question")
    text: str = Field(..., description="The question content")
    options: List[str] = Field(..., description="Exactly 4 multiple choice options")
    correct_idx: int = Field(..., description="Index (0-3) of the correct answer")
    explanation: str = Field(..., description="Why this answer is correct")

class QuizSchema(BaseModel):
    title: str = Field(..., description="Subject of the quiz")
    questions: List[QuizQuestion] = Field(..., description="List of 5 questions")

async def update_quiz_prof_id(quiz_id: str, profile_id: str):
    supabase.table("questionnaires").update({
        "profiles_id": profile_id
    }).eq("id", quiz_id).execute()