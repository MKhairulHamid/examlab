-- Per-user redemption records for promo_codes. Also the source of truth for the
-- frontend per-exam access gate (active row = expires_at > now()).
-- Applied via migration create_promo_codes.

create table if not exists public.promo_redemptions (
  id uuid not null default extensions.uuid_generate_v4 (),
  promo_code_id uuid not null,
  user_id uuid not null,
  exam_type_id uuid not null,
  redeemed_at timestamp with time zone not null default timezone ('utc'::text, now()),
  expires_at timestamp with time zone not null,
  constraint promo_redemptions_pkey primary key (id),
  constraint promo_redemptions_unique unique (promo_code_id, user_id),
  constraint promo_redemptions_code_fkey foreign key (promo_code_id) references public.promo_codes (id) on delete cascade,
  constraint promo_redemptions_user_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint promo_redemptions_exam_fkey foreign key (exam_type_id) references public.exam_types (id) on delete cascade
) TABLESPACE pg_default;

create index if not exists idx_promo_redemptions_user on public.promo_redemptions using btree (user_id);
create index if not exists idx_promo_redemptions_user_exam on public.promo_redemptions using btree (user_id, exam_type_id);

-- RLS: users may read only their own redemptions (used by the frontend access gate).
alter table public.promo_redemptions enable row level security;

create policy "Users can read their own redemptions"
  on public.promo_redemptions
  for select
  using (auth.uid() = user_id);


-- Atomic redemption. Called by an authenticated user via RPC with their JWT.
-- SECURITY DEFINER so it can lock the promo row and write the redemption while
-- the caller has no direct table privileges. Returns the unlocked exam + expiry.
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

  if exists (
    select 1 from public.promo_redemptions
    where promo_code_id = v_promo.id and user_id = v_user
  ) then
    select slug, name into v_exam_slug, v_exam_name from public.exam_types where id = v_promo.exam_type_id;
    return jsonb_build_object(
      'success', true,
      'alreadyRedeemed', true,
      'exam_type_id', v_promo.exam_type_id,
      'exam_slug', v_exam_slug,
      'exam_name', v_exam_name,
      'error', 'You have already redeemed this code.'
    );
  end if;

  if v_promo.used_count >= v_promo.max_uses then
    return jsonb_build_object('success', false, 'error', 'This code has reached its usage limit.');
  end if;

  select greatest(now(), coalesce(max(expires_at), now()))
  into v_base
  from public.promo_redemptions
  where user_id = v_user
    and exam_type_id = v_promo.exam_type_id
    and expires_at > now();

  v_expires := coalesce(v_base, now()) + make_interval(days => v_promo.duration_days);

  insert into public.promo_redemptions (promo_code_id, user_id, exam_type_id, expires_at)
  values (v_promo.id, v_user, v_promo.exam_type_id, v_expires);

  update public.promo_codes
  set used_count = used_count + 1
  where id = v_promo.id;

  select slug, name into v_exam_slug, v_exam_name from public.exam_types where id = v_promo.exam_type_id;

  return jsonb_build_object(
    'success', true,
    'exam_type_id', v_promo.exam_type_id,
    'exam_slug', v_exam_slug,
    'exam_name', v_exam_name,
    'expires_at', v_expires,
    'duration_days', v_promo.duration_days
  );
end;
$$;

revoke all on function public.redeem_promo_code (text) from public;
grant execute on function public.redeem_promo_code (text) to authenticated;
