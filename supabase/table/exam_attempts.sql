create table public.exam_attempts (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  question_set_id uuid not null,
  started_at timestamp with time zone not null default timezone ('utc'::text, now()),
  completed_at timestamp with time zone null,
  time_spent_seconds integer null,
  answers_json jsonb null,
  raw_score integer null,
  percentage_score numeric(5, 2) null,
  scaled_score integer null,
  passed boolean null,
  status text null default 'in_progress'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint exam_attempts_pkey primary key (id),
  constraint exam_attempts_question_set_id_fkey foreign KEY (question_set_id) references question_sets (id) on delete CASCADE,
  constraint exam_attempts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_exam_attempts_user on public.exam_attempts using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_exam_attempts_question_set on public.exam_attempts using btree (question_set_id) TABLESPACE pg_default;

create index IF not exists idx_exam_attempts_status on public.exam_attempts using btree (status) TABLESPACE pg_default;

create index IF not exists idx_exam_attempts_completed on public.exam_attempts using btree (completed_at) TABLESPACE pg_default;

create index IF not exists idx_exam_attempts_answers on public.exam_attempts using gin (answers_json) TABLESPACE pg_default;

create trigger update_exam_attempts_updated_at BEFORE
update on exam_attempts for EACH row
execute FUNCTION update_updated_at_column ();