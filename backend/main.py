import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.core.llms import ChatMessage
from llama_index.core.workflow import Context

from tools import create_tools
from chat import save_message
from chat_init import initialize_chat_session
from quiz import update_quiz_prof_id


load_dotenv()

# --- 1. CONFIGURATION ---
Settings.llm = Groq(
    model="openai/gpt-oss-120b",
    api_key=os.getenv("GROQ_API_KEY"),
)
Settings.embed_model = HuggingFaceEmbedding(
    model_name="Qwen/Qwen3-Embedding-0.6B", 
    device="cpu"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. ENDPOINTS ---

@app.post("/chat")
async def chat(
    message: str = Form(...),
    profiles_id: str = Form(...),
    thread_id: str = Form(None),
    file: UploadFile = File(None)
):
    session = await initialize_chat_session(message, thread_id, profiles_id, file)

    context_instruction = ""
    if file:
        context_instruction = f"""
        NOTE: A new document ({file.filename}) has been uploaded. 
        Focus ONLY on this new content and ignore previous document discussions unless asked to compare.
        """

    chat_prompt = f"""
    You are a helpful educational assistant.
    {context_instruction} 
    - THINK before answering.
    - If you do not know the answer, say you don't know.
    CONTEXT FROM DOCUMENT:
    {session['document_context'] if session['document_context'] else "No document provided."}
    """

    response = await Settings.llm.achat(
        messages=[
            ChatMessage(role='system', content=chat_prompt),
            *session['history'],
            ChatMessage(role='user', content=message)
        ]
    )

    answer = str(response.message.content)
    await save_message(session['thread_id'], 'assistant', answer, profiles_id)

    return {'answer': answer, 'thread_id': session['thread_id']}

@app.post("/quiz")
async def quiz(
    message: str = Form(...),
    profiles_id: str = Form(...),
    thread_id: str = Form(None),
    file: UploadFile = File(None)
):
    session = await initialize_chat_session(message, thread_id, profiles_id, file)
    tools = create_tools(session['index'])

    quiz_schema = """
    {
        "title": "Quiz Title",
        "questions": [
            {"text": "string", "options": ["a", "b", "c", "d"], "correct_idx": int, "explanation": "string"}
        ]
    }
    """
    quiz_result_schema = """{ "quiz_id": "string" }"""

    agent_prompt = f"""
    You are a Quiz Generation Engine. 

    SCHEMA:
    You must generate a list of questions where each object follows this EXACT structure:
    {quiz_schema}

    RESPONSE SCHEMA:
    ONLY return this EXACT structure: {quiz_result_schema}

    STRICT RULES:
    1. 'correct_idx' MUST be an integer (0-3).
    2. 'options' MUST be an array of exactly 4 strings.
    3. Once you have built this structure, pass it to 'save_quiz' immediately.
    4. Do NOT add any extra fields or change the key names.
    5. If not given by the user, limit questions to 5.
    6. You decide the Quiz Title.
    CONTEXT FROM DOCUMENT:
    {session['document_context'] if session['document_context'] else "No document provided."}
    
    TASK: 
    If a document is present, generate questions and call 'save_quiz'.
    """

    agent = FunctionAgent(
        name="EaseDucation_Quiz_Agent",
        tools=tools,
        llm=Settings.llm,
        system_prompt=agent_prompt,
        streaming=False,
    )

    ctx = Context(agent)
    
    # Run the agent
    response = await agent.run(
        user_msg=message, 
        memory=session['memory'], 
        ctx=ctx,
        temperature=0.2,
        max_iterations=10,
        verbose=False
    )

    quiz_id = json.loads(response.raw["choices"][0]["message"]["content"])["quiz_id"]
    # commit first before making start quiz ui

    await save_message(session['thread_id'], 'assistant', "Quiz Generated!", profiles_id)

    await update_quiz_prof_id(quiz_id, profiles_id)

    return {
        'quiz_id': quiz_id, 
        'thread_id': session['thread_id'],
        'answer': "Quiz Generated!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)