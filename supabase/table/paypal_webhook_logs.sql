create table public.packages (
  id uuid not null default extensions.uuid_generate_v4 (),
  exam_type_id uuid not null,
  name text not null,
  description text null,
  question_set_ids uuid[] not null,
  price_cents integer not null,
  original_price_cents integer not null,
  discount_percentage integer null,
  currency text null default 'usd'::text,
  is_active boolean null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint packages_pkey primary key (id),
  constraint packages_exam_type_id_fkey foreign KEY (exam_type_id) references exam_types (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_packages_exam_type on public.packages using btree (exam_type_id) TABLESPACE pg_default;

create trigger update_packages_updated_at BEFORE
update on packages for EACH row
execute FUNCTION update_updated_at_column ();