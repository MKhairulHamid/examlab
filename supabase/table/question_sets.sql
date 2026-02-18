create table public.question_sets (
  id uuid not null default extensions.uuid_generate_v4 (),
  exam_type_id uuid not null,
  name text not null,
  description text null,
  set_number integer not null,
  question_count integer not null,
  questions_json jsonb not null,
  version_number integer not null default 1,
  content_hash text null,
  last_content_update timestamp with time zone not null default timezone ('utc'::text, now()),
  price_cents integer not null,
  currency text null default 'usd'::text,
  is_free_sample boolean null default false,
  sample_question_count integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint question_sets_pkey primary key (id),
  constraint unique_set_per_exam unique (exam_type_id, set_number),
  constraint question_sets_exam_type_id_fkey foreign KEY (exam_type_id) references exam_types (id) on delete CASCADE,
  constraint set_number_range check (
    (
      (set_number >= 1)
      and (set_number <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_question_sets_exam_type on public.question_sets using btree (exam_type_id) TABLESPACE pg_default;

create index IF not exists idx_question_sets_active on public.question_sets using btree (is_active) TABLESPACE pg_default;

create index IF not exists idx_question_sets_version on public.question_sets using btree (id, version_number, last_content_update) TABLESPACE pg_default;

create index IF not exists idx_question_sets_json on public.question_sets using gin (questions_json) TABLESPACE pg_default;

create trigger increment_question_set_version_trigger BEFORE
update on question_sets for EACH row
execute FUNCTION increment_question_set_version ();

create trigger update_question_sets_updated_at BEFORE
update on question_sets for EACH row
execute FUNCTION update_updated_at_column ();

-- RLS: Free samples for everyone, paid sets for active subscribers only
alter table public.question_sets enable row level security;

create policy "Anyone can read free sample question sets"
  on public.question_sets
  for select
  using (is_free_sample = true);

create policy "Subscribed users can read paid question sets"
  on public.question_sets
  for select
  using (
    exists (
      select 1 from public.user_subscriptions
      where user_subscriptions.user_id = auth.uid()
        and user_subscriptions.status = 'active'
    )
  );