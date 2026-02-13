create table public.subscription_plans (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  price_cents integer not null,
  currency text null default 'usd'::text,
  interval_unit text not null,
  interval_count integer not null default 1,
  paypal_plan_id text not null,
  is_active boolean null default true,
  display_order integer null default 0,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint subscription_plans_pkey primary key (id),
  constraint subscription_plans_slug_key unique (slug)
) TABLESPACE pg_default;

-- RLS: All authenticated users can read plans
alter table public.subscription_plans enable row level security;

create policy "Anyone can read active subscription plans"
  on public.subscription_plans
  for select
  using (is_active = true);
