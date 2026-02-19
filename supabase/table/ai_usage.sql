-- ============================================================
-- ai_usage: tracks daily AI call counts per user.
-- Used to enforce the 200 calls/day limit for paid users.
-- Free users are not tracked here (they can only use cached
-- predefined responses; custom prompts are blocked at the
-- edge function level).
-- ============================================================

create table public.ai_usage (
  id          uuid not null default extensions.uuid_generate_v4(),
  user_id     uuid not null,
  usage_date  date not null default current_date,
  call_count  integer not null default 0,
  constraint ai_usage_pkey            primary key (id),
  constraint ai_usage_user_date_key   unique (user_id, usage_date),
  constraint ai_usage_user_id_fkey    foreign key (user_id)
    references auth.users(id) on delete cascade,
  constraint ai_usage_count_positive  check (call_count >= 0)
) tablespace pg_default;

create index if not exists idx_ai_usage_user_date
  on public.ai_usage using btree (user_id, usage_date);

-- RLS: users can read their own usage (e.g. to show "X / 200 used today")
alter table public.ai_usage enable row level security;

create policy "Users can read their own AI usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

-- ============================================================
-- increment_ai_usage(p_user_id)
-- Atomically upserts today's row and increments call_count.
-- Returns the NEW call_count after the increment.
-- Called by the ai-explanation edge function (service role).
-- ============================================================
create or replace function public.increment_ai_usage(p_user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  insert into public.ai_usage (user_id, usage_date, call_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set call_count = ai_usage.call_count + 1
  returning call_count into new_count;

  return new_count;
end;
$$;
