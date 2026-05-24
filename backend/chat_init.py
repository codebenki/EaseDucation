import os
import shutil
from doc_persist import get_index, rebuild_index
from chat import get_memory, save_message, create_thread
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
from llama_index.core.memory import ChatMemoryBuffer
from fastapi import UploadFile

DATA_DIR = "./data"
async def initialize_chat_session(message: str, thread_id: str, profiles_id: str, file: UploadFile):
    file_name = file.filename if file else None

    if not thread_id or thread_id == "null":
        thread_id = await create_thread(message, profiles_id)
    
    history = await get_memory(thread_id)
    await save_message(thread_id, 'user', message, profiles_id)

    # A. Indexing/Retrieving from Supabase
    if file:
        if not os.path.exists(DATA_DIR): os.makedirs(DATA_DIR)
        file_path = os.path.join(DATA_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Pass profiles_id to tag the new vectors
        index = rebuild_index(file_path, profiles_id)
        os.remove(file_path)
    else:
        index = get_index(profiles_id)

    # B. Retrieval with User-Specific Filtering
    document_context = ""
    if index:
        filters_list = [ExactMatchFilter(key="profiles_id", value=profiles_id)]

        if file_name:
            filters_list.append(ExactMatchFilter(key="file_name", value=file_name))
        
        # Create a filter so we only search vectors belonging to THIS user
        filters = MetadataFilters(filters=filters_list)
        
        query_engine = index.as_query_engine(
            similarity_top_k=3,
            filters=filters # Apply the lock
        )
        retrieval_response = query_engine.query(message)
        document_context = str(retrieval_response)
    
    memory = ChatMemoryBuffer.from_defaults(chat_history=history)
    
    return {
        "thread_id": thread_id,
        "history": history,
        "document_context": document_context,
        "memory": memory,
        "index": index # Needed for the quiz tools
    }