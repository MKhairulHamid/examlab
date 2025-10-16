-- =====================================================
-- STUDY STREAK TABLE
-- =====================================================
-- Track user's daily study streak
CREATE TABLE IF NOT EXISTS study_streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Current streak
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    
    -- Last activity tracking
    last_activity_date DATE,
    
    -- Daily goal
    daily_goal_questions INTEGER DEFAULT 20 NOT NULL,
    
    -- Study days tracking (JSONB array of dates)
    -- Structure: { "dates": ["2024-01-01", "2024-01-02", ...] }
    study_days_json JSONB DEFAULT '{"dates": []}'::jsonb,
    
    -- Metadata
    total_study_days INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    CONSTRAINT unique_user_streak UNIQUE (user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_study_streaks_user ON study_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_streaks_last_activity ON study_streaks(last_activity_date);

-- Enable Row Level Security
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own streak
CREATE POLICY "Users can view own streak" ON study_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streak" ON study_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON study_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_study_streaks_updated_at BEFORE UPDATE ON study_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update study streak
CREATE OR REPLACE FUNCTION update_study_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_study_days JSONB;
    v_dates_array TEXT[];
BEGIN
    -- Get or create streak record
    INSERT INTO study_streaks (user_id, last_activity_date, current_streak, longest_streak, total_study_days)
    VALUES (user_uuid, v_today, 1, 1, 1)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Get current streak data
    SELECT last_activity_date, current_streak, longest_streak, study_days_json
    INTO v_last_activity, v_current_streak, v_longest_streak, v_study_days
    FROM study_streaks
    WHERE user_id = user_uuid;
    
    -- If already studied today, just return
    IF v_last_activity = v_today THEN
        RETURN;
    END IF;
    
    -- Update streak
    IF v_last_activity = v_yesterday THEN
        -- Continue streak
        v_current_streak := v_current_streak + 1;
    ELSIF v_last_activity < v_yesterday THEN
        -- Streak broken, reset to 1
        v_current_streak := 1;
    ELSE
        -- First time or future date, set to 1
        v_current_streak := 1;
    END IF;
    
    -- Update longest streak
    IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
    END IF;
    
    -- Add today to study days
    v_dates_array := ARRAY(SELECT jsonb_array_elements_text(v_study_days->'dates'));
    IF NOT (v_today::TEXT = ANY(v_dates_array)) THEN
        v_dates_array := array_append(v_dates_array, v_today::TEXT);
        v_study_days := jsonb_build_object('dates', to_jsonb(v_dates_array));
    END IF;
    
    -- Update the record
    UPDATE study_streaks
    SET 
        last_activity_date = v_today,
        current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        study_days_json = v_study_days,
        total_study_days = array_length(v_dates_array, 1),
        updated_at = TIMEZONE('utc', NOW())
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get streak statistics
CREATE OR REPLACE FUNCTION get_study_streak_stats(user_uuid UUID)
RETURNS TABLE (
    current_streak INTEGER,
    longest_streak INTEGER,
    total_study_days INTEGER,
    last_activity_date DATE,
    study_days_json JSONB,
    daily_goal_questions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.current_streak,
        ss.longest_streak,
        ss.total_study_days,
        ss.last_activity_date,
        ss.study_days_json,
        ss.daily_goal_questions
    FROM study_streaks ss
    WHERE ss.user_id = user_uuid;
    
    -- If no record found, return defaults
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 0, 0, 0, NULL::DATE, '{"dates": []}'::JSONB, 20;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE study_streaks IS 'Track daily study streaks for users';
COMMENT ON COLUMN study_streaks.study_days_json IS 'Array of dates when user studied';

