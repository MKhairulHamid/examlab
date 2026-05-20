-- Pricing update: May 2026
-- Monthly: $5 → $19.99 | Quarterly: removed | Annual: $30 → $99
-- PayPal Sandbox Product: PROD-7R3452281L597835V

-- Update monthly plan ($19.99/month)
UPDATE public.subscription_plans
SET
  price_cents    = 1999,
  paypal_plan_id = 'P-3AF88707SD294541WNIGS3HQ',
  updated_at     = now()
WHERE slug = 'monthly';

-- Deactivate quarterly plan (keep row for historical records)
UPDATE public.subscription_plans
SET
  is_active  = false,
  updated_at = now()
WHERE slug = 'quarterly';

-- Update annual plan ($99/year)
UPDATE public.subscription_plans
SET
  price_cents    = 9900,
  paypal_plan_id = 'P-5T862359VR731651KNIGS3KY',
  updated_at     = now()
WHERE slug = 'annual';
