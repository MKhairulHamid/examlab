create table public.question_items (
  id uuid not null default extensions.uuid_generate_v4(),
  question_set_id uuid not null,
  question_number integer not null,
  question_text text not null,
  question_type text not null default 'Multiple Choice'::text,
  domain text null,
  options jsonb not null,
  correct_answers jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  ai_cache jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint question_items_pkey primary key (id),
  constraint question_items_question_set_id_fkey foreign key (question_set_id)
    references public.question_sets(id) on delete cascade,
  constraint question_items_type_check check (
    question_type in ('Multiple Choice', 'Multiple Response')
  ),
  constraint question_items_number_positive check (question_number > 0)
) tablespace pg_default;

-- Index: lookups by question set (most common query pattern)
create index if not exists idx_question_items_question_set_id
  on public.question_items using btree (question_set_id) tablespace pg_default;

-- Index: domain-based performance analysis
create index if not exists idx_question_items_domain
  on public.question_items using btree (domain) tablespace pg_default;

-- Index: question type performance analysis
create index if not exists idx_question_items_question_type
  on public.question_items using btree (question_type) tablespace pg_default;

-- Composite index: efficient "domain accuracy per set" analysis queries
create index if not exists idx_question_items_set_domain
  on public.question_items using btree (question_set_id, domain) tablespace pg_default;

-- Composite index: ordered question loading
create index if not exists idx_question_items_set_number
  on public.question_items using btree (question_set_id, question_number) tablespace pg_default;

-- RLS
alter table public.question_items enable row level security;

create policy "Anyone can read question_items from free sample sets"
  on public.question_items
  for select
  using (
    exists (
      select 1 from public.question_sets
      where question_sets.id = question_items.question_set_id
        and question_sets.is_free_sample = true
    )
  );

create policy "Subscribed users can read question_items from paid sets"
  on public.question_items
  for select
  using (
    exists (
      select 1 from public.question_sets
      where question_sets.id = question_items.question_set_id
    )
    and
    exists (
      select 1 from public.user_subscriptions
      where user_subscriptions.user_id = auth.uid()
        and user_subscriptions.status = 'active'
    )
  );

-- Allow edge functions (service role) to update ai_cache
-- Service role bypasses RLS automatically; no additional policy needed.
