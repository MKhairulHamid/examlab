create table public.user_subscriptions (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  plan_id uuid not null,
  paypal_subscription_id text null,
  status text not null default 'pending'::text,
  current_period_start timestamp with time zone null,
  current_period_end timestamp with time zone null,
  cancelled_at timestamp with time zone null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_subscriptions_pkey primary key (id),
  constraint user_subscriptions_paypal_subscription_id_key unique (paypal_subscription_id),
  constraint user_subscriptions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint user_subscriptions_plan_id_fkey foreign key (plan_id) references subscription_plans (id)
) TABLESPACE pg_default;

create index if not exists idx_user_subscriptions_user on public.user_subscriptions using btree (user_id) TABLESPACE pg_default;
create index if not exists idx_user_subscriptions_status on public.user_subscriptions using btree (status) TABLESPACE pg_default;
create index if not exists idx_user_subscriptions_paypal on public.user_subscriptions using btree (paypal_subscription_id) TABLESPACE pg_default;

-- RLS: Users can only read their own subscriptions
alter table public.user_subscriptions enable row level security;

create policy "Users can read their own subscriptions"
  on public.user_subscriptions
  for select
  using (auth.uid() = user_id);

create trigger update_user_subscriptions_updated_at before
update on user_subscriptions for each row
execute function update_updated_at_column ();
