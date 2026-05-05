import os
from llama_index.core import VectorStoreIndex, StorageContext, SimpleDirectoryReader
from llama_index.readers.docling import DoclingReader
from llama_index.vector_stores.supabase import SupabaseVectorStore

def get_vector_store():
    """
    Initializes the Supabase Vector Store. 
    Fetches DB URL inside the function to ensure load_dotenv() has run.
    """
    db_connection = os.getenv("SUPABASE_DB_URL")
    if not db_connection:
        raise ValueError("SUPABASE_DB_URL not found in environment variables.")

    return SupabaseVectorStore(
        postgres_connection_string=db_connection,
        collection_name="base_documents", 
        table_name="doc_embeddings",      
        dimension=1024                    
    )

def get_index(profiles_id: str):
    """
    Connects to the existing Supabase vector store and returns the index.
    Note: Filtering happens at the query level in main.py.
    """
    vector_store = get_vector_store()
    return VectorStoreIndex.from_vector_store(vector_store)

def rebuild_index(file_path: str, profiles_id: str):
    """
    Parses a file, generates embeddings using Gemma, and stores them in Supabase.
    Tags each chunk with 'profiles_id' for multi-tenant isolation.
    """
    # 1. Setup Supabase storage context
    vector_store = get_vector_store()
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    
    # 2. Parse the document using Docling
    reader = SimpleDirectoryReader(
        input_files=[file_path], 
        file_extractor={
            ".pdf": DoclingReader(),
            ".docx": DoclingReader(),
            ".pptx": DoclingReader(),
            ".html": DoclingReader()
        }
    )
    
    documents = reader.load_data()
    
    # 3. Inject profiles_id into metadata for every chunk
    for doc in documents:
        doc.metadata["profiles_id"] = str(profiles_id)
        doc.metadata["file_path"] = file_path

    # 4. Create index (this triggers the embedding and upload to Supabase)
    # This does NOT save locally because no persist_dir is provided.
    index = VectorStoreIndex.from_documents(
        documents, 
        storage_context=storage_context,
    )
    
    return index