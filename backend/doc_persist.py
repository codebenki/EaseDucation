import os
from llama_index.core import (
    VectorStoreIndex, 
    SimpleDirectoryReader, 
    StorageContext, 
    load_index_from_storage
)
from llama_index.readers.docling import DoclingReader

STORAGE_DIR = "./storage"
DATA_DIR = "./data"


def get_index():
    if os.path.exists(STORAGE_DIR) and os.listdir(STORAGE_DIR):
        storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
        return load_index_from_storage(storage_context)
    return None

def rebuild_index(file_path):
    """Indexes a single file and persists it."""
    reader = SimpleDirectoryReader(input_files=[file_path], file_extractor={
        ".pdf": DoclingReader(),
        ".docx": DoclingReader(),
        ".pptx": DoclingReader(),
        ".html": DoclingReader()
    })
    
    documents = reader.load_data()
    index = VectorStoreIndex.from_documents(documents)
    index.storage_context.persist(persist_dir=STORAGE_DIR)
    return index