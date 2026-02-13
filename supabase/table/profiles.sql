create table public.paypal_webhook_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint paypal_webhook_logs_pkey primary key (id),
  constraint paypal_webhook_logs_event_id_key unique (event_id)
) TABLESPACE pg_default;

create index IF not exists idx_paypal_webhook_logs_event_id on public.paypal_webhook_logs using btree (event_id) TABLESPACE pg_default;

create index IF not exists idx_paypal_webhook_logs_event_type on public.paypal_webhook_logs using btree (event_type) TABLESPACE pg_default;

create index IF not exists idx_paypal_webhook_logs_processed on public.paypal_webhook_logs using btree (processed) TABLESPACE pg_default;