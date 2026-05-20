-- ============================================================
-- CloudExamLab — Full Schema Setup
-- Strategy: create ALL tables first, then add ALL policies.
-- This avoids cross-table FK references in policies failing
-- because the referenced table doesn't exist yet.
-- ============================================================


-- ============================================================
-- 0. SHARED UTILITY FUNCTIONS
-- ============================================================

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.increment_question_set_version()
returns trigger language plpgsql as $$
begin
  if new.questions_json is distinct from old.questions_json then
    new.version_number      = old.version_number + 1;
    new.last_content_update = timezone('utc', now());
  end if;
  return new;
end;
$$;

create or replace function public.increment_ai_usage(p_user_id uuid)
returns integer language plpgsql security definer as $$
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


-- ============================================================
-- 1. TABLES (no RLS policies yet)
-- ============================================================

-- profiles
create table if not exists public.profiles (
  id              uuid        not null references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  exam_dates_json jsonb       not null default '[]'::jsonb,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  constraint profiles_pkey primary key (id)
) tablespace pg_default;

create index if not exists idx_profiles_exam_dates on public.profiles using gin (exam_dates_json);

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- exam_types
create table if not exists public.exam_types (
  id               uuid        not null default extensions.uuid_generate_v4(),
  name             text        not null,
  slug             text        not null,
  provider         text        not null,
  description      text,
  icon             text,
  total_questions  integer,
  duration_minutes integer,
  passing_score    integer,
  max_score        integer     default 1000,
  is_active        boolean     default true,
  display_order    integer     default 0,
  landing_content  jsonb,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now()),
  constraint exam_types_pkey     primary key (id),
  constraint exam_types_slug_key unique (slug)
) tablespace pg_default;

create trigger update_exam_types_updated_at
  before update on public.exam_types
  for each row execute function public.update_updated_at_column();

-- subscription_plans (needed before user_subscriptions FK)
create table if not exists public.subscription_plans (
  id             uuid        not null default extensions.uuid_generate_v4(),
  name           text        not null,
  slug           text        not null,
  price_cents    integer     not null,
  currency       text        default 'usd',
  interval_unit  text        not null,
  interval_count integer     not null default 1,
  paypal_plan_id text        not null,
  is_active      boolean     default true,
  display_order  integer     default 0,
  created_at     timestamptz not null default timezone('utc', now()),
  constraint subscription_plans_pkey     primary key (id),
  constraint subscription_plans_slug_key unique (slug)
) tablespace pg_default;

-- user_subscriptions (needed before question_sets RLS policy)
create table if not exists public.user_subscriptions (
  id                     uuid        not null default extensions.uuid_generate_v4(),
  user_id                uuid        not null references auth.users(id) on delete cascade,
  plan_id                uuid        not null references public.subscription_plans(id),
  paypal_subscription_id text,
  status                 text        not null default 'pending',
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancelled_at           timestamptz,
  created_at             timestamptz not null default timezone('utc', now()),
  updated_at             timestamptz not null default timezone('utc', now()),
  constraint user_subscriptions_pkey                       primary key (id),
  constraint user_subscriptions_paypal_subscription_id_key unique (paypal_subscription_id)
) tablespace pg_default;

create index if not exists idx_user_subscriptions_user   on public.user_subscriptions using btree (user_id);
create index if not exists idx_user_subscriptions_status on public.user_subscriptions using btree (status);
create index if not exists idx_user_subscriptions_paypal on public.user_subscriptions using btree (paypal_subscription_id);

create trigger update_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function public.update_updated_at_column();

-- question_sets
create table if not exists public.question_sets (
  id                    uuid        not null default extensions.uuid_generate_v4(),
  exam_type_id          uuid        not null references public.exam_types(id) on delete cascade,
  name                  text        not null,
  description           text,
  set_number            integer     not null,
  question_count        integer     not null,
  questions_json        jsonb       not null,
  version_number        integer     not null default 1,
  content_hash          text,
  last_content_update   timestamptz not null default timezone('utc', now()),
  price_cents           integer     not null,
  currency              text        default 'usd',
  is_free_sample        boolean     default false,
  sample_question_count integer     default 0,
  is_active             boolean     default true,
  created_at            timestamptz not null default timezone('utc', now()),
  updated_at            timestamptz not null default timezone('utc', now()),
  constraint question_sets_pkey      primary key (id),
  constraint unique_set_per_exam     unique (exam_type_id, set_number),
  constraint set_number_range        check (set_number >= 1 and set_number <= 5)
) tablespace pg_default;

create index if not exists idx_question_sets_exam_type on public.question_sets using btree (exam_type_id);
create index if not exists idx_question_sets_active    on public.question_sets using btree (is_active);
create index if not exists idx_question_sets_version   on public.question_sets using btree (id, version_number, last_content_update);
create index if not exists idx_question_sets_json      on public.question_sets using gin  (questions_json);

create trigger increment_question_set_version_trigger
  before update on public.question_sets
  for each row execute function public.increment_question_set_version();

create trigger update_question_sets_updated_at
  before update on public.question_sets
  for each row execute function public.update_updated_at_column();

-- question_items
create table if not exists public.question_items (
  id              uuid        not null default extensions.uuid_generate_v4(),
  question_set_id uuid        not null references public.question_sets(id) on delete cascade,
  question_number integer     not null,
  question_text   text        not null,
  question_type   text        not null default 'Multiple Choice',
  domain          text,
  options         jsonb       not null,
  correct_answers jsonb       not null default '[]'::jsonb,
  tags            jsonb       not null default '[]'::jsonb,
  ai_cache        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default timezone('utc', now()),
  constraint question_items_pkey            primary key (id),
  constraint question_items_type_check      check (question_type in ('Multiple Choice', 'Multiple Response')),
  constraint question_items_number_positive check (question_number > 0)
) tablespace pg_default;

create index if not exists idx_question_items_question_set_id on public.question_items using btree (question_set_id);
create index if not exists idx_question_items_domain          on public.question_items using btree (domain);
create index if not exists idx_question_items_question_type   on public.question_items using btree (question_type);
create index if not exists idx_question_items_set_domain      on public.question_items using btree (question_set_id, domain);
create index if not exists idx_question_items_set_number      on public.question_items using btree (question_set_id, question_number);

-- user_enrollments
create table if not exists public.user_enrollments (
  id           uuid        not null default extensions.uuid_generate_v4(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  exam_type_id uuid        not null references public.exam_types(id) on delete cascade,
  enrolled_at  timestamptz not null default timezone('utc', now()),
  constraint user_enrollments_pkey   primary key (id),
  constraint user_enrollments_unique unique (user_id, exam_type_id)
) tablespace pg_default;

create index if not exists idx_user_enrollments_user on public.user_enrollments using btree (user_id);
create index if not exists idx_user_enrollments_exam on public.user_enrollments using btree (exam_type_id);

-- exam_attempts
create table if not exists public.exam_attempts (
  id                 uuid        not null default extensions.uuid_generate_v4(),
  user_id            uuid        not null references auth.users(id) on delete cascade,
  question_set_id    uuid        not null references public.question_sets(id) on delete cascade,
  started_at         timestamptz not null default timezone('utc', now()),
  completed_at       timestamptz,
  time_spent_seconds integer,
  answers_json       jsonb,
  raw_score          integer,
  percentage_score   numeric(5,2),
  scaled_score       integer,
  passed             boolean,
  status             text        default 'in_progress',
  created_at         timestamptz not null default timezone('utc', now()),
  updated_at         timestamptz not null default timezone('utc', now()),
  constraint exam_attempts_pkey primary key (id)
) tablespace pg_default;

create index if not exists idx_exam_attempts_user         on public.exam_attempts using btree (user_id);
create index if not exists idx_exam_attempts_question_set on public.exam_attempts using btree (question_set_id);
create index if not exists idx_exam_attempts_status       on public.exam_attempts using btree (status);
create index if not exists idx_exam_attempts_completed    on public.exam_attempts using btree (completed_at);
create index if not exists idx_exam_attempts_answers      on public.exam_attempts using gin  (answers_json);

create trigger update_exam_attempts_updated_at
  before update on public.exam_attempts
  for each row execute function public.update_updated_at_column();

-- user_progress
create table if not exists public.user_progress (
  id                      uuid        not null default extensions.uuid_generate_v4(),
  exam_attempt_id         uuid        not null references public.exam_attempts(id) on delete cascade,
  question_set_id         uuid        not null references public.question_sets(id) on delete cascade,
  user_id                 uuid        not null references auth.users(id) on delete cascade,
  current_question_number integer     not null default 0,
  current_answers_json    jsonb       not null default '{}'::jsonb,
  time_elapsed_seconds    integer     not null default 0,
  timer_paused            boolean     not null default false,
  status                  text        not null default 'in_progress',
  started_at              timestamptz,
  completed_at            timestamptz,
  last_synced_at          timestamptz,
  updated_at              timestamptz not null default timezone('utc', now()),
  created_at              timestamptz not null default timezone('utc', now()),
  constraint user_progress_pkey           primary key (id),
  constraint user_progress_attempt_unique unique (exam_attempt_id)
) tablespace pg_default;

create index if not exists idx_user_progress_user    on public.user_progress using btree (user_id);
create index if not exists idx_user_progress_attempt on public.user_progress using btree (exam_attempt_id);

create trigger update_user_progress_updated_at
  before update on public.user_progress
  for each row execute function public.update_updated_at_column();

-- ai_usage
create table if not exists public.ai_usage (
  id         uuid    not null default extensions.uuid_generate_v4(),
  user_id    uuid    not null references auth.users(id) on delete cascade,
  usage_date date    not null default current_date,
  call_count integer not null default 0,
  constraint ai_usage_pkey           primary key (id),
  constraint ai_usage_user_date_key  unique (user_id, usage_date),
  constraint ai_usage_count_positive check (call_count >= 0)
) tablespace pg_default;

create index if not exists idx_ai_usage_user_date on public.ai_usage using btree (user_id, usage_date);

-- study_streaks
create table if not exists public.study_streaks (
  id                   uuid        not null default extensions.uuid_generate_v4(),
  user_id              uuid        not null references auth.users(id) on delete cascade,
  current_streak       integer     not null default 0,
  longest_streak       integer     not null default 0,
  last_activity_date   date,
  daily_goal_questions integer     not null default 20,
  study_days_json      jsonb       default '{"dates": []}'::jsonb,
  total_study_days     integer     not null default 0,
  created_at           timestamptz not null default timezone('utc', now()),
  updated_at           timestamptz not null default timezone('utc', now()),
  constraint study_streaks_pkey  primary key (id),
  constraint unique_user_streak  unique (user_id)
) tablespace pg_default;

create index if not exists idx_study_streaks_user          on public.study_streaks using btree (user_id);
create index if not exists idx_study_streaks_last_activity on public.study_streaks using btree (last_activity_date);

create trigger update_study_streaks_updated_at
  before update on public.study_streaks
  for each row execute function public.update_updated_at_column();

-- paypal_webhook_logs
create table if not exists public.paypal_webhook_logs (
  id         uuid        not null default extensions.uuid_generate_v4(),
  event_id   text        not null,
  event_type text        not null,
  payload    jsonb       not null,
  processed  boolean     default false,
  created_at timestamptz default now(),
  constraint paypal_webhook_logs_pkey         primary key (id),
  constraint paypal_webhook_logs_event_id_key unique (event_id)
) tablespace pg_default;

create index if not exists idx_paypal_webhook_logs_event_id   on public.paypal_webhook_logs using btree (event_id);
create index if not exists idx_paypal_webhook_logs_event_type on public.paypal_webhook_logs using btree (event_type);
create index if not exists idx_paypal_webhook_logs_processed  on public.paypal_webhook_logs using btree (processed);


-- ============================================================
-- 2. ENABLE RLS ON ALL TABLES
-- ============================================================

alter table public.profiles             enable row level security;
alter table public.exam_types           enable row level security;
alter table public.subscription_plans   enable row level security;
alter table public.user_subscriptions   enable row level security;
alter table public.question_sets        enable row level security;
alter table public.question_items       enable row level security;
alter table public.user_enrollments     enable row level security;
alter table public.exam_attempts        enable row level security;
alter table public.user_progress        enable row level security;
alter table public.ai_usage             enable row level security;
alter table public.study_streaks        enable row level security;
alter table public.paypal_webhook_logs  enable row level security;


-- ============================================================
-- 3. RLS POLICIES (all tables exist by this point)
-- ============================================================

-- profiles
create policy "Users can read their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- exam_types
create policy "Anyone can read active exam types"
  on public.exam_types for select using (is_active = true);

-- subscription_plans
create policy "Anyone can read active subscription plans"
  on public.subscription_plans for select using (is_active = true);

-- user_subscriptions
create policy "Users can read their own subscriptions"
  on public.user_subscriptions for select using (auth.uid() = user_id);

-- question_sets
create policy "Anyone can read free sample question sets"
  on public.question_sets for select using (is_free_sample = true);
create policy "Subscribed users can read paid question sets"
  on public.question_sets for select
  using (
    exists (
      select 1 from public.user_subscriptions
      where user_subscriptions.user_id = auth.uid()
        and user_subscriptions.status = 'active'
    )
  );

-- question_items
create policy "Anyone can read question_items from free sample sets"
  on public.question_items for select
  using (
    exists (
      select 1 from public.question_sets
      where question_sets.id = question_items.question_set_id
        and question_sets.is_free_sample = true
    )
  );
create policy "Subscribed users can read question_items from paid sets"
  on public.question_items for select
  using (
    exists (
      select 1 from public.user_subscriptions
      where user_subscriptions.user_id = auth.uid()
        and user_subscriptions.status = 'active'
    )
  );

-- user_enrollments
create policy "Users can read their own enrollments"
  on public.user_enrollments for select using (auth.uid() = user_id);
create policy "Users can insert their own enrollments"
  on public.user_enrollments for insert with check (auth.uid() = user_id);

-- exam_attempts
create policy "Users can read their own exam attempts"
  on public.exam_attempts for select using (auth.uid() = user_id);
create policy "Users can insert their own exam attempts"
  on public.exam_attempts for insert with check (auth.uid() = user_id);
create policy "Users can update their own exam attempts"
  on public.exam_attempts for update using (auth.uid() = user_id);

-- user_progress
create policy "Users can manage their own progress"
  on public.user_progress for all using (auth.uid() = user_id);

-- ai_usage
create policy "Users can read their own AI usage"
  on public.ai_usage for select using (auth.uid() = user_id);

-- study_streaks
create policy "Users can manage their own study streak"
  on public.study_streaks for all using (auth.uid() = user_id);

-- paypal_webhook_logs: no client access — service role only via edge functions


-- ============================================================
-- 4. SEED DATA — Subscription Plans
-- ============================================================

insert into public.subscription_plans
  (name, slug, price_cents, interval_unit, interval_count, paypal_plan_id, is_active, display_order)
values
  ('Monthly', 'monthly', 1999, 'month', 1, 'P-3AF88707SD294541WNIGS3HQ', true, 1),
  ('Annual',  'annual',  9900, 'year',  1, 'P-5T862359VR731651KNIGS3KY', true, 2)
on conflict (slug) do update set
  price_cents    = excluded.price_cents,
  paypal_plan_id = excluded.paypal_plan_id,
  is_active      = excluded.is_active;


-- ============================================================
-- DONE
-- ============================================================
