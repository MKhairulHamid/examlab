create table public.exam_types (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  provider text not null,
  description text null,
  icon text null,
  total_questions integer null,
  duration_minutes integer null,
  passing_score integer null,
  max_score integer null default 1000,
  is_active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint exam_types_pkey primary key (id),
  constraint exam_types_slug_key unique (slug)
) TABLESPACE pg_default;

create trigger update_exam_types_updated_at BEFORE
update on exam_types for EACH row
execute FUNCTION update_updated_at_column ();