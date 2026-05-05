-- 1. Create the Threads table
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT DEFAULT 'New Conversation', -- We'll update this after the first message
    profiles_id UUID REFERENCES profiles(id), -- Prepared for when you add login
    last_activity_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Update Chat Messages to link to Threads
-- If you already have the table, we add the foreign key constraint
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id) ON DELETE CASCADE;

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

create policy "Enable read access for all users"
on public.threads
for select
to authenticated
using (
  auth.uid() = profiles_id
);