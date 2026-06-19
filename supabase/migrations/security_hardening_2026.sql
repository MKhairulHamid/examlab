-- Security hardening (2026-06-20)
-- Closes findings from risk audit:
--   1. admin_notes had RLS disabled — any anon/user could read/write/delete via REST API
--   2. increment_ai_usage accepted arbitrary p_user_id — allowed quota griefing across users
--   3. profiles UPDATE policy had no WITH CHECK — users could self-elevate is_admin flag
--   4. Trigger-only functions were callable via REST API as SECURITY DEFINER RPCs
--   5. PUBLIC had EXECUTE on internal functions that should never be user-callable

-- ── Step 1: Lock down admin_notes ─────────────────────────────────────────────
-- No policies = service_role (admin-api edge function) only. All user access blocked.
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- ── Step 2: Fix increment_ai_usage to use auth.uid() internally ───────────────
-- Previously accepted arbitrary p_user_id, allowing any authenticated user to
-- inflate another user's daily AI quota counter. Now ignores the argument and
-- derives the caller from the JWT. Also pins search_path.
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  new_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.ai_usage (user_id, usage_date, call_count)
  VALUES (v_user, current_date, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET call_count = ai_usage.call_count + 1
  RETURNING call_count INTO new_count;

  RETURN new_count;
END;
$$;

-- ── Step 3: Block is_admin self-elevation on profiles ─────────────────────────
-- Old policy had no WITH CHECK, so a user could PATCH is_admin=true on their own row.
-- Admin-api authorizes by ADMIN_EMAIL (never reads this flag), so this is defense-in-depth.
-- Users can still freely edit full_name, exam_dates_json, focused_course_slug.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT is_admin FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ── Step 4: Harden trigger-only and internal functions ───────────────────────
-- Fix update_updated_at_column and increment_question_set_version:
-- they were missing a pinned search_path. Keep as SECURITY INVOKER (correct for triggers).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_question_set_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.version_number = OLD.version_number + 1;
  NEW.last_content_update = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Revoke PUBLIC execute from trigger-only and internal functions.
-- PostgreSQL grants EXECUTE to PUBLIC by default; must revoke PUBLIC not just named roles.
-- Triggers fire with owner permissions regardless of these grants.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_question_set_version() FROM PUBLIC;

-- increment_ai_usage: authenticated only (enforces auth.uid() internally).
REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(uuid) TO authenticated;

-- redeem_promo_code: authenticated only (no reason to expose to anon at REST layer).
REVOKE EXECUTE ON FUNCTION public.redeem_promo_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(text) TO authenticated;

-- Intentionally kept callable:
--   get_certificate_by_code  → anon + authenticated  (public /verify page)
--   issue_certificate        → authenticated          (user-facing certificate issuance)
