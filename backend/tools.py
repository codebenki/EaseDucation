from use_supabase import use_supabase
from llama_index.core.tools import FunctionTool, QueryEngineTool, ToolMetadata
from quiz import QuizSchema

supabase = use_supabase()

def save_quiz_to_db(quiz_data: dict):
    """
    Saves a generated quiz to Supabase. 
    Expects 'title' and a list of 'questions'.
    """
    try:
        
        if isinstance(quiz_data, dict):
            quiz = QuizSchema(**quiz_data)
        else:
            quiz = quiz_data

        # 2. Insert into 'questionnaires' table
        header_resp = supabase.table("questionnaires").insert({
            "title": quiz.title
        }).execute()
        
        # Get the ID of the newly created questionnaire
        quiz_id = header_resp.data[0]['id']

        # 3. Prepare questions for bulk insert
        questions_to_insert = []
        for q in quiz.questions:
            questions_to_insert.append({
                "questionnaire_id": quiz_id,
                "question_text": q.text,
                "options": q.options,
                "correct_idx": q.correct_idx,
                "explanation": q.explanation
            })
        
        # 4. Bulk insert into 'questions' table
        supabase.table("questions").insert(questions_to_insert).execute()
        
        return {"quiz_id": quiz_id}
    except Exception as e:
        return f"ERROR: The save failed. {str(e)}"

# This combines both tools for the Agent
def create_tools(index):
    query_engine = index.as_query_engine(similarity_top_k=5)
    
    query_tool = QueryEngineTool(
        query_engine=query_engine,
        metadata=ToolMetadata(
            name="document_search",
            description="Searches the document for facts to answer questions or generate quiz content."
        )
    )

    save_quiz = FunctionTool.from_defaults(
        fn=save_quiz_to_db,
        name="save_quiz",
        description="Call this to save a quiz. Input is a JSON with 'title' and 'questions' array."
    )
    
    return [query_tool, save_quiz]