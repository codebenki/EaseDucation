from llama_index.core.llms import ChatMessage
from use_supabase import use_supabase

supabase = use_supabase()

async def get_memory(session_id: str):
    """Fetches last 20 messages from Supabase and converts them to LlamaIndex format."""
    response = supabase.table("chat_messages") \
        .select("role", "content") \
        .eq("session_id", session_id) \
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

async def save_message(session_id: str, role: str, content: str):
    """Saves a single message to the Supabase table."""
    supabase.table("chat_messages").insert({
        "session_id": session_id,
        "role": role,
        "content": content
    }).execute()