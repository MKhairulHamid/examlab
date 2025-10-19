-- =====================================================
-- ADD EXAM DATES TO USER PROFILES
-- =====================================================
-- Add a column to store multiple exam dates with exam type IDs

-- Add exam_dates_json column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS exam_dates_json JSONB DEFAULT '[]'::jsonb;

-- Structure: [
--   {
--     "exam_type_id": "uuid",
--     "exam_name": "AWS Solutions Architect",
--     "exam_date": "2024-12-31",
--     "created_at": "2024-01-01T00:00:00Z"
--   }
-- ]

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_exam_dates ON profiles USING GIN (exam_dates_json);

-- Add comment
COMMENT ON COLUMN profiles.exam_dates_json IS 'Array of exam dates with exam type IDs and metadata';

