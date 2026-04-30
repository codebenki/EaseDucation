from dotenv import load_dotenv
from use_supabase import use_supabase
from llama_index.core.tools import FunctionTool, QueryEngineTool, ToolMetadata
from quiz import QuizSchema

load_dotenv()

supabase = use_supabase()

def save_quiz_to_db(quiz_data: dict):
    """
    Saves a generated quiz to Supabase. 
    Expects 'title' and a list of 'questions'.
    """
    try:
        # 1. Validate the dictionary against Pydantic
        quiz = QuizSchema(**quiz_data)
        
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
        
        print(f"DB SUCCESS: Saved quiz '{quiz.title}' with ID {quiz_id}")
        return f"Successfully saved the quiz '{quiz.title}' to the database. Quiz ID: {quiz_id}"

    except Exception as e:
        print(f"DB ERROR: {str(e)}")
        return f"Error saving quiz to database: {str(e)}"

# This combines both tools for the Agent
def create_tools(index):
    query_engine = index.as_query_engine(similarity_top_k=3)
    
    query_tool = QueryEngineTool(
        query_engine=query_engine,
        metadata=ToolMetadata(
            name="document_search",
            description="Searches the document for facts to answer questions or generate quiz content."
        )
    )

    save_tool = FunctionTool.from_defaults(
        fn=save_quiz_to_db,
        name="save_quiz",
        description="Call this to save a quiz. Input is a JSON with 'title' and 'questions' array."
    )
    
    return [query_tool, save_tool]