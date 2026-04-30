-- 1. Create the Questionnaires table (The Header)
CREATE TABLE IF NOT EXISTS questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- Optional: Link to user
);

-- 2. Create the Questions table (The Details)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Stores ["A", "B", "C", "D"]
    correct_idx INTEGER NOT NULL CHECK (correct_idx >= 0 AND correct_idx <= 3),
    explanation TEXT
);

-- 3. Enable Row Level Security (RLS)
-- Note: If you're just testing locally, you can skip these, 
-- but for production, these are mandatory.
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON questions(questionnaire_id);