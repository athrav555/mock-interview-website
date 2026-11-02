-- ====================================================================
-- AI MOCK INTERVIEW FOR WORKING PROFESSIONALS - SUPABASE DATABASE SCHEMA
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if needed (clean migration)
DROP TABLE IF EXISTS public.evaluations CASCADE;
DROP TABLE IF EXISTS public.responses CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 3. Users / Executive Profiles Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    current_role TEXT,
    years_of_experience INTEGER DEFAULT 0,
    industry TEXT,
    target_role TEXT,
    resume_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Sessions Table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('behavioral', 'technical', 'system_design', 'leadership')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('mid_level', 'senior', 'staff', 'executive')),
    duration INTEGER DEFAULT 0, -- Duration in seconds
    overall_score NUMERIC(5,2) DEFAULT NULL, -- Score from 0 to 100
    completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (completion_status IN ('pending', 'in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Questions Table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    ai_question_prompt TEXT NOT NULL,
    competency_category TEXT NOT NULL, -- e.g. 'Strategic Leadership', 'High-Scale Architecture', 'Conflict Resolution'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Responses Table
CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    verbatim_transcript TEXT NOT NULL,
    duration INTEGER DEFAULT 0, -- Duration answering in seconds
    speaking_pace_wpm NUMERIC(6,2) DEFAULT 0, -- Words Per Minute
    filler_word_count INTEGER DEFAULT 0, -- Count of "um", "uh", "like", etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Evaluations Table
CREATE TABLE public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    category_scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. { "communication": 90, "technical_depth": 88, "problem_solving": 92, "executive_presence": 86 }
    star_adherence JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. { "situation": "Clear context", "task": "Identified objective", "action": "Decisive steps", "result": "Quantified impact", "score": 90 }
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of strengths
    improvements JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of actionable improvements
    ideal_answer TEXT NOT NULL, -- Model executive answer
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(completion_status);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON public.questions(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON public.responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id ON public.evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_question_id ON public.evaluations(question_id);

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Sessions Table Policies
CREATE POLICY "Users can view own sessions"
    ON public.sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON public.sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON public.sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON public.sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Questions Table Policies
CREATE POLICY "Users can view questions from own sessions"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = questions.session_id
            AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions to own sessions"
    ON public.questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = questions.session_id
            AND sessions.user_id = auth.uid()
        )
    );

-- Responses Table Policies
CREATE POLICY "Users can view responses from own sessions"
    ON public.responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = responses.session_id
            AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert responses into own sessions"
    ON public.responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = responses.session_id
            AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update responses in own sessions"
    ON public.responses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = responses.session_id
            AND sessions.user_id = auth.uid()
        )
    );

-- Evaluations Table Policies
CREATE POLICY "Users can view evaluations from own sessions"
    ON public.evaluations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = evaluations.session_id
            AND sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert evaluations into own sessions"
    ON public.evaluations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = evaluations.session_id
            AND sessions.user_id = auth.uid()
        )
    );

-- 10. Automatically create user profile when user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
