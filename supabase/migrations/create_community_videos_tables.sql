-- =====================================================
-- COMMUNITY VIDEOS — "Teach It to Learn It"
-- =====================================================
-- Learners record themselves teaching a study session (YouTube public/unlisted
-- or Loom) and submit the link. Submissions are PRE-MODERATED: a row is
-- `pending` until an admin approves it, and the public only ever sees `approved`
-- rows. Each learner has one submission per (course, session); resubmitting
-- upserts and resets the row to `pending`.

-- ── community_videos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_videos (
    id               UUID        NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_slug      TEXT        NOT NULL,
    session_id       TEXT        NOT NULL,
    provider         TEXT        NOT NULL CHECK (provider IN ('youtube', 'loom')),
    video_url        TEXT        NOT NULL,                 -- original submitted URL
    video_ref        TEXT        NOT NULL,                 -- extracted id (youtube videoId / loom share id)
    start_seconds    INTEGER,                              -- optional YouTube start offset
    title            TEXT        NOT NULL,
    note             TEXT,                                 -- optional "what I cover"
    submitter_name   TEXT        NOT NULL,                 -- denormalized display name (no profile join needed publicly)
    status           TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    report_count     INTEGER     NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    reviewed_at      TIMESTAMPTZ,
    reviewed_by      UUID,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT community_videos_pkey PRIMARY KEY (id),
    CONSTRAINT community_videos_user_session_unique UNIQUE (user_id, course_slug, session_id)
);

CREATE INDEX IF NOT EXISTS idx_community_videos_session
    ON public.community_videos USING btree (course_slug, session_id, status);

CREATE TRIGGER update_community_videos_updated_at
    BEFORE UPDATE ON public.community_videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security
ALTER TABLE public.community_videos ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) sees approved videos; owners also see their own (any status).
CREATE POLICY "Approved videos are public, owners see their own"
    ON public.community_videos FOR SELECT
    USING (status = 'approved' OR auth.uid() = user_id);

-- Learners can submit only their own rows, only in the pending state.
CREATE POLICY "Users can submit own videos as pending"
    ON public.community_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Learners can resubmit/update their own row, but it must land back in pending
-- (they cannot self-approve).
CREATE POLICY "Users can resubmit own videos as pending"
    ON public.community_videos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete own videos"
    ON public.community_videos FOR DELETE
    USING (auth.uid() = user_id);

-- NOTE: admin approve/reject/hide is performed by the admin-api edge function
-- using the service role key, which bypasses RLS — so no admin policy is needed.

COMMENT ON TABLE public.community_videos IS 'Learner-submitted "teach it" videos (pre-moderated) shown on study sessions';


-- ── community_video_reports ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_video_reports (
    id          UUID        NOT NULL DEFAULT extensions.uuid_generate_v4(),
    video_id    UUID        NOT NULL REFERENCES public.community_videos(id) ON DELETE CASCADE,
    reporter_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason      TEXT        NOT NULL
                            CHECK (reason IN ('inappropriate', 'wrong_topic', 'poor_quality', 'copyright', 'spam', 'other')),
    detail      TEXT,
    status      TEXT        NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'resolved', 'dismissed')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT community_video_reports_pkey PRIMARY KEY (id),
    CONSTRAINT community_video_reports_one_per_user UNIQUE (video_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_community_video_reports_video
    ON public.community_video_reports USING btree (video_id);

CREATE INDEX IF NOT EXISTS idx_community_video_reports_status
    ON public.community_video_reports USING btree (status);

ALTER TABLE public.community_video_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can file a report as themselves.
CREATE POLICY "Users can report videos"
    ON public.community_video_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- No public SELECT: only admins read reports, via the edge function (service role).

COMMENT ON TABLE public.community_video_reports IS 'User reports against community_videos; reviewed in the admin panel';


-- ── report_count maintenance + auto-hide ──────────────────────────────────────
-- When a report is filed, bump the parent video's report_count. If an APPROVED
-- video accumulates enough reports, auto-hide it pending admin re-review.
CREATE OR REPLACE FUNCTION public.bump_community_video_report_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    auto_hide_threshold CONSTANT INTEGER := 3;
    new_count INTEGER;
BEGIN
    UPDATE public.community_videos
       SET report_count = report_count + 1
     WHERE id = NEW.video_id
    RETURNING report_count INTO new_count;

    IF new_count >= auto_hide_threshold THEN
        UPDATE public.community_videos
           SET status = 'hidden'
         WHERE id = NEW.video_id
           AND status = 'approved';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_community_video_report_count
    AFTER INSERT ON public.community_video_reports
    FOR EACH ROW EXECUTE FUNCTION public.bump_community_video_report_count();

-- This SECURITY DEFINER function must only run as a trigger — never be callable
-- directly via the REST RPC endpoint. Revoke EXECUTE from the API roles.
REVOKE EXECUTE ON FUNCTION public.bump_community_video_report_count() FROM PUBLIC, anon, authenticated;
