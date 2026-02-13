create table public.user_purchases (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  question_set_id uuid null,
  package_id uuid null,
  payment_provider_id text null,
  payment_customer_id text null,
  amount_cents integer not null,
  currency text null default 'usd'::text,
  payment_status text not null,
  is_active boolean null default true,
  purchased_at timestamp with time zone not null default timezone ('utc'::text, now()),
  expires_at timestamp with time zone null,
  payment_provider text null default 'paypal'::text,
  constraint user_purchases_pkey primary key (id),
  constraint user_purchases_stripe_payment_intent_id_key unique (payment_provider_id),
  constraint user_purchases_package_id_fkey foreign KEY (package_id) references packages (id) on delete set null,
  constraint user_purchases_question_set_id_fkey foreign KEY (question_set_id) references question_sets (id) on delete set null,
  constraint user_purchases_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint purchase_type_check check (
    (
      (
        (question_set_id is not null)
        and (package_id is null)
      )
      or (
        (question_set_id is null)
        and (package_id is not null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_user on public.user_purchases using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_question_set on public.user_purchases using btree (question_set_id) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_package on public.user_purchases using btree (package_id) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_stripe on public.user_purchases using btree (payment_provider_id) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_status on public.user_purchases using btree (payment_status) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_payment_provider on public.user_purchases using btree (payment_provider) TABLESPACE pg_default;

create index IF not exists idx_user_purchases_payment_provider_id on public.user_purchases using btree (payment_provider_id) TABLESPACE pg_default;

$body = @{
  name = "ExamLab All Access"
  type = "SERVICE"
  category = "EDUCATIONAL_AND_TEXTBOOKS"
  description = "Unlimited access to all Cloud Exam Lab practice exams"
} | ConvertTo-Json

$product = Invoke-RestMethod -Uri "https://api-m.sandbox.paypal.com/v1/catalogs/products" -Method POST -Headers @{ "Authorization" = "Bearer $token" } -ContentType "application/json" -Body $body

Write-Host "Product ID: $($product.id)"