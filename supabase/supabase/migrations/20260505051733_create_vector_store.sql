-- The vecs library requires the schema to exist
CREATE SCHEMA IF NOT EXISTS vecs;

-- Ensure pgvector is enabled
CREATE EXTENSION IF NOT EXISTS vector;