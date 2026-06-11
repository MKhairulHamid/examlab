-- Promotional codes: admin-defined shareable codes that grant time-boxed,
-- per-exam access. One shared code per campaign, capped by max_uses.
-- Applied via migration create_promo_codes.

create table if not exists public.promo_codes (
  id uuid not null default extensions.uuid_generate_v4 (),
  code text not null,
  exam_type_id uuid not null,
  target_group text not null,
  duration_days integer not null,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint promo_codes_pkey primary key (id),
  constraint promo_codes_code_key unique (code),
  constraint promo_codes_exam_type_id_fkey foreign key (exam_type_id) references public.exam_types (id) on delete cascade,
  constraint promo_codes_duration_days_check check (duration_days in (1, 3, 7, 30)),
  constraint promo_codes_max_uses_check check (max_uses >= 1)
) TABLESPACE pg_default;

create index if not exists idx_promo_codes_code on public.promo_codes using btree (code);
create index if not exists idx_promo_codes_exam on public.promo_codes using btree (exam_type_id);

-- RLS: no public access. All reads/writes go through the admin-api (service role)
-- or the redeem_promo_code() SECURITY DEFINER function (see promo_redemptions.sql).
alter table public.promo_codes enable row level security;
