CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    profiles_id UUID REFERENCES profiles(id), -- Optional for now
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

create policy "Enable read access for all users"
on public.chat_messages
for select
to authenticated
using (
  auth.uid() = profiles_id
);