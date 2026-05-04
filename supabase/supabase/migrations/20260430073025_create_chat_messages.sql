CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id), -- Optional for now
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL
);