from llama_index.core.llms import ChatMessage
from use_supabase import use_supabase

supabase = use_supabase()

async def get_memory(thread_id: str):
    """Fetches last 20 messages from Supabase and converts them to LlamaIndex format."""
    response = supabase.table("chat_messages") \
        .select("role", "content") \
        .eq("thread_id", thread_id) \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()
    
    # Reverse so they are in chronological order
    db_messages = reversed(response.data)
    
    # Convert DB rows to LlamaIndex ChatMessage objects
    return [
        ChatMessage(role=msg["role"], content=msg["content"]) 
        for msg in db_messages
    ]

async def save_message(thread_id: str, role: str, content: str, profiles_id: str):
    """Saves a single message to the Supabase table."""
    supabase.table("chat_messages").insert({
        "profiles_id": profiles_id,
        "thread_id": thread_id,
        "role": role,
        "content": content
    }).execute()

async def create_thread(first_message: str, profiles_id: str):
    """Creates a thread and generates a title from the first message."""
    # Simple title generation: First 40 chars + ...
    generated_title = (first_message[:40] + '..') if len(first_message) > 40 else first_message
    
    response = supabase.table("threads").insert({
        "profiles_id": profiles_id,
        "title": generated_title
    }).execute()
    
    return response.data[0]['id']