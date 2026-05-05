import os
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


load_dotenv()

# --- 1. CONFIGURATION ---
Settings.llm = Groq(
    model="openai/gpt-oss-20b",
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

    chat_prompt = f"""
    You are a helpful educational assistant. 
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

    agent_prompt = f"""
    You are an expert educational quiz creator. 
    CONTEXT FROM DOCUMENT:
    {session['document_context'] if session['document_context'] else "No document provided."}
    
    TASK: Generate a quiz based ONLY on the context and call the 'save_quiz' tool.
    """

    agent = FunctionAgent(
        name="EaseDucation_Quiz_Agent",
        tools=tools,
        llm=Settings.llm,
        system_prompt=agent_prompt
    )

    ctx = Context(agent)
    
    response = await agent.run(user_msg=message, memory=session['memory'], ctx=ctx)
    answer = str(response)

    await save_message(session['thread_id'], 'assistant', answer, profiles_id)

    return {
        'answer': answer, 
        'thread_id': session['thread_id'],
        'mode': 'quiz_generated'
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)