import os
import shutil
from dotenv import load_dotenv
from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.core.workflow import Context
from llama_index.core.llms import ChatMessage
from tools import create_tools
from doc_persist import get_index, rebuild_index, STORAGE_DIR, DATA_DIR
from chat import get_memory, save_message

load_dotenv()

Settings.llm = Groq(
    model="openai/gpt-oss-120b", 
    api_key=os.getenv("GROQ_API_KEY"),
)
Settings.embed_model = HuggingFaceEmbedding(
    model_name="BAAI/bge-small-en-v1.5", 
    device="cpu"
)

# --- 3. API IMPLEMENTATION ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(
    message: str = Form(...),
    file: UploadFile = File(None),
):
    # test on postman. create dummy thread_id
    thread_id = "c71657c7-5782-4512-8212-b78397c44523"
    history = await get_memory(thread_id)
    memory = ChatMemoryBuffer.from_defaults(chat_history=history)

    user_intent = await Settings.llm.acomplete(f"""
        -----------------------------
        Rules:
        - Summarize is a CHAT intent.
        - Quiz is a TASK intent.                                     
        -----------------------------
        Clarify the intnt of this message as 'CHAT' or 'TASK': {message}
    """
    )
    # STEP 1: Handle Document Parsing
    if file:
        if not os.path.exists(DATA_DIR): os.makedirs(DATA_DIR)
        file_path = os.path.join(DATA_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        index = rebuild_index(file_path)
        os.remove(file_path) # Clean up source file
    else:
        index = get_index()

    # STEP 2: Retrieve Context (The "Reading" part)
    document_context = ""
    if index:
        query_engine = index.as_query_engine(similarity_top_k=3)
        retrieval_response = query_engine.query(message)
        document_context = str(retrieval_response)

    # ai routing
    chat_prompt = f"""
        You are a helpful educational assistant.

        Rules:
        - DO NOT answer outside of topic.
        - Explain the context or topic simply.
        - THINK before answering.
        - If you do not know the answer, say you do not know.

        CONTEXT FROM UPLOADED DOCUMENT:
        ------------------
        {document_context if document_context else "No document uploaded yet."}
        ------------------
    """

    if 'CHAT' in str(user_intent).upper():
        response = await Settings.llm.achat(
            messages = [
                ChatMessage(role='system', content=chat_prompt),
                *history,
                ChatMessage(role='user', content=message)
            ]
        )

        answer = str(response.message.content)
        await save_message(thread_id, 'assistant', answer)

        return {'answer': answer}

    elif 'TASK' in str(user_intent).upper():
        tools = create_tools(index)

        task_prompt = chat_prompt + """
        AGENT TASK INSTRUCTIONS:
        1. If the user wants a quiz, read the context provided above.
        2. Create 5 or the number given by the user, multiple-choice questions based ONLY on that context.
        3. Do not include questions outside the context like: 'what is the path of the document?'.
        4. Format the data into a JSON structure with 'title' and 'questions'.
        5. Call 'save_quiz' with this JSON data.
        6. DO NOT just list the questions in chat; you MUST call the tool to save them.
        """

        agent = FunctionAgent(
            name="EaseDucation_Agent",
            tools=tools,
            llm=Settings.llm,
            system_prompt=task_prompt
        )
        ctx = Context(agent)

        await save_message(thread_id, 'user', message)
        response = await agent.run(user_msg=message, ctx=ctx, memory=memory)
        answer = str(response)

        await save_message(thread_id, 'assistant', answer)

        return {'answer': answer}
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)