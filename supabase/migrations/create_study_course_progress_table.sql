-- =====================================================
-- STUDY COURSE PROGRESS TABLE
-- =====================================================
-- Per-user, per-course study progress: which sessions are completed and the
-- learner's confidence tag for each section. One row per (user, course).
CREATE TABLE IF NOT EXISTS public.study_course_progress (
    id                 UUID        NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_slug        TEXT        NOT NULL,
    completed_sessions JSONB       NOT NULL DEFAULT '[]'::jsonb,  -- array of session ids
    confidence         JSONB       NOT NULL DEFAULT '{}'::jsonb,  -- { "<sessionId>::<sectionIdx>": "mastered" | "almost" | "confused" }
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT study_course_progress_pkey PRIMARY KEY (id),
    CONSTRAINT study_course_progress_user_course_unique UNIQUE (user_id, course_slug)
);

CREATE INDEX IF NOT EXISTS idx_study_course_progress_user ON public.study_course_progress USING btree (user_id);

-- Row Level Security: users can only see/manage their own rows
ALTER TABLE public.study_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study progress" ON public.study_course_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study progress" ON public.study_course_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study progress" ON public.study_course_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Keep updated_at fresh on every update
CREATE TRIGGER update_study_course_progress_updated_at
    BEFORE UPDATE ON public.study_course_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.study_course_progress IS 'Per-user study progress (completed sessions + per-section confidence) for guided courses';
