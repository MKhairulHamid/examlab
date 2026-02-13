create table public.user_enrollments (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  exam_type_id uuid not null,
  enrolled_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_enrollments_pkey primary key (id),
  constraint user_enrollments_unique unique (user_id, exam_type_id),
  constraint user_enrollments_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint user_enrollments_exam_type_id_fkey foreign key (exam_type_id) references exam_types (id) on delete cascade
) TABLESPACE pg_default;

create index if not exists idx_user_enrollments_user on public.user_enrollments using btree (user_id) TABLESPACE pg_default;
create index if not exists idx_user_enrollments_exam on public.user_enrollments using btree (exam_type_id) TABLESPACE pg_default;

-- RLS: Users can read and insert their own enrollments
alter table public.user_enrollments enable row level security;

create policy "Users can read their own enrollments"
  on public.user_enrollments
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own enrollments"
  on public.user_enrollments
  for insert
  with check (auth.uid() = user_id);
