-- Promo codes: add a redemption deadline (redeem_by) and an all-programs flag.
-- redeem_by = the moment after which a code can no longer be redeemed (distinct
-- from duration_days, which is the access length AFTER redeeming).
-- all_programs = true unlocks every exam instead of one specific exam_type_id.

-- ── promo_codes ──────────────────────────────────────────────────────────────
alter table public.promo_codes
  add column if not exists redeem_by timestamptz,
  add column if not exists all_programs boolean not null default false;

-- exam_type_id becomes optional: null when all_programs = true.
alter table public.promo_codes alter column exam_type_id drop not null;

-- Exactly one of (specific exam) / (all programs).
alter table public.promo_codes drop constraint if exists promo_codes_target_check;
alter table public.promo_codes add constraint promo_codes_target_check
  check ((all_programs = true and exam_type_id is null)
      or (all_programs = false and exam_type_id is not null));

-- Backfill existing codes: redeemable for 3 days from their creation date.
update public.promo_codes
  set redeem_by = created_at + interval '3 days'
  where redeem_by is null;

-- ── promo_redemptions ────────────────────────────────────────────────────────
alter table public.promo_redemptions
  add column if not exists all_programs boolean not null default false;

-- exam_type_id is null for all-programs redemptions.
alter table public.promo_redemptions alter column exam_type_id drop not null;

-- ── redeem_promo_code() ──────────────────────────────────────────────────────
-- Adds: redemption-window enforcement and all-programs branch. Single-exam path
-- is otherwise unchanged.
create or replace function public.redeem_promo_code (p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_promo public.promo_codes%rowtype;
  v_base timestamptz;
  v_expires timestamptz;
  v_exam_slug text;
  v_exam_name text;
begin
  if v_user is null then
    return jsonb_build_object('success', false, 'error', 'You must be signed in to redeem a code.');
  end if;

  select * into v_promo
  from public.promo_codes
  where upper(code) = upper(trim(p_code))
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'That code is not valid.');
  end if;

  if not v_promo.is_active then
    return jsonb_build_object('success', false, 'error', 'This code is no longer active.');
  end if;

  if v_promo.redeem_by is not null and now() > v_promo.redeem_by then
    return jsonb_build_object('success', false, 'error', 'This code''s redemption window has closed.');
  end if;

  -- Already redeemed by this user? Return their existing access.
  if exists (
    select 1 from public.promo_redemptions
    where promo_code_id = v_promo.id and user_id = v_user
  ) then
    if v_promo.all_programs then
      return jsonb_build_object(
        'success', true, 'alreadyRedeemed', true, 'all_programs', true,
        'exam_name', 'all certifications', 'exam_slug', null,
        'error', 'You have already redeemed this code.'
      );
    end if;
    select slug, name into v_exam_slug, v_exam_name from public.exam_types where id = v_promo.exam_type_id;
    return jsonb_build_object(
      'success', true, 'alreadyRedeemed', true,
      'exam_type_id', v_promo.exam_type_id, 'exam_slug', v_exam_slug, 'exam_name', v_exam_name,
      'error', 'You have already redeemed this code.'
    );
  end if;

  if v_promo.used_count >= v_promo.max_uses then
    return jsonb_build_object('success', false, 'error', 'This code has reached its usage limit.');
  end if;

  if v_promo.all_programs then
    -- Stack onto any existing all-programs access the user still has.
    select greatest(now(), coalesce(max(expires_at), now()))
    into v_base
    from public.promo_redemptions
    where user_id = v_user and all_programs = true and expires_at > now();

    v_expires := coalesce(v_base, now()) + make_interval(days => v_promo.duration_days);

    insert into public.promo_redemptions (promo_code_id, user_id, exam_type_id, all_programs, expires_at)
    values (v_promo.id, v_user, null, true, v_expires);

    update public.promo_codes set used_count = used_count + 1 where id = v_promo.id;

    return jsonb_build_object(
      'success', true, 'all_programs', true,
      'exam_name', 'all certifications', 'exam_slug', null,
      'expires_at', v_expires, 'duration_days', v_promo.duration_days
    );
  end if;

  -- Single-exam path.
  select greatest(now(), coalesce(max(expires_at), now()))
  into v_base
  from public.promo_redemptions
  where user_id = v_user
    and exam_type_id = v_promo.exam_type_id
    and expires_at > now();

  v_expires := coalesce(v_base, now()) + make_interval(days => v_promo.duration_days);

  insert into public.promo_redemptions (promo_code_id, user_id, exam_type_id, expires_at)
  values (v_promo.id, v_user, v_promo.exam_type_id, v_expires);

  update public.promo_codes set used_count = used_count + 1 where id = v_promo.id;

  select slug, name into v_exam_slug, v_exam_name from public.exam_types where id = v_promo.exam_type_id;

  return jsonb_build_object(
    'success', true,
    'exam_type_id', v_promo.exam_type_id, 'exam_slug', v_exam_slug, 'exam_name', v_exam_name,
    'expires_at', v_expires, 'duration_days', v_promo.duration_days
  );
end;
$$;

revoke all on function public.redeem_promo_code (text) from public;
grant execute on function public.redeem_promo_code (text) to authenticated;
