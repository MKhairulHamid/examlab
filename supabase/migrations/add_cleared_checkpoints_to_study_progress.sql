-- Add cleared_checkpoints to study_course_progress
-- Stores which speed-bump checkpoints have been cleared per session,
-- so users can resume mid-session on any device.
--
-- Shape: { "<sessionId>": [<afterSectionIdx>, ...], ... }
-- e.g.   { "d1-s1": [3, 5, 6] }

ALTER TABLE public.study_course_progress
  ADD COLUMN IF NOT EXISTS cleared_checkpoints JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.study_course_progress.cleared_checkpoints IS
  'Map of sessionId → array of afterSection indices that the user has cleared. e.g. {"d1-s1": [3, 5, 6]}';
