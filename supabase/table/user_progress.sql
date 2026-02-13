create table public.study_streaks (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date null,
  daily_goal_questions integer not null default 20,
  study_days_json jsonb null default '{"dates": []}'::jsonb,
  total_study_days integer not null default 0,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint study_streaks_pkey primary key (id),
  constraint unique_user_streak unique (user_id),
  constraint study_streaks_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_study_streaks_user on public.study_streaks using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_study_streaks_last_activity on public.study_streaks using btree (last_activity_date) TABLESPACE pg_default;

create index IF not exists idx_study_streaks_user_id on public.study_streaks using btree (user_id) TABLESPACE pg_default;

create trigger update_study_streaks_updated_at BEFORE
update on study_streaks for EACH row
execute FUNCTION update_updated_at_column ();