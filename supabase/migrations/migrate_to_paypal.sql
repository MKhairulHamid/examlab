-- Migration: Convert Stripe columns to generic payment provider columns
-- This allows supporting multiple payment providers (PayPal, Stripe, etc.)

-- Step 1: Rename Stripe-specific columns to generic names
ALTER TABLE IF EXISTS user_purchases 
  RENAME COLUMN stripe_payment_intent_id TO payment_provider_id;

ALTER TABLE IF EXISTS user_purchases 
  RENAME COLUMN stripe_customer_id TO payment_customer_id;

-- Step 2: Add payment provider column (defaults to 'paypal' for new records)
ALTER TABLE IF EXISTS user_purchases 
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'paypal';

-- Step 3: Update existing records to mark them as 'stripe' (if any exist)
UPDATE user_purchases 
SET payment_provider = 'stripe' 
WHERE payment_provider IS NULL 
  AND payment_provider_id IS NOT NULL 
  AND payment_provider_id LIKE 'pi_%'; -- Stripe payment intents start with 'pi_'

-- Step 4: Create PayPal webhook logs table
CREATE TABLE IF NOT EXISTS paypal_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_logs_event_id 
  ON paypal_webhook_logs(event_id);

-- Step 6: Create index on event_type for filtering
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_logs_event_type 
  ON paypal_webhook_logs(event_type);

-- Step 7: Create index on processed status
CREATE INDEX IF NOT EXISTS idx_paypal_webhook_logs_processed 
  ON paypal_webhook_logs(processed);

-- Step 8: Add comment to table
COMMENT ON TABLE paypal_webhook_logs IS 'Stores PayPal webhook events for payment processing and debugging';

-- Step 9: Rename stripe_webhook_logs table to be provider-agnostic (if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'stripe_webhook_logs'
  ) THEN
    ALTER TABLE stripe_webhook_logs RENAME TO payment_webhook_logs_archive;
    COMMENT ON TABLE payment_webhook_logs_archive IS 'Archived Stripe webhook logs (legacy)';
  END IF;
END $$;

-- Step 10: Add index on payment_provider for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_purchases_payment_provider 
  ON user_purchases(payment_provider);

-- Step 11: Add index on payment_provider_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_purchases_payment_provider_id 
  ON user_purchases(payment_provider_id);

-- Migration complete
-- Next steps:
-- 1. Deploy PayPal edge functions (create-paypal-order, paypal-webhook)
-- 2. Configure PayPal webhook URL in PayPal Developer Dashboard
-- 3. Add environment variables to Supabase:
--    - PAYPAL_CLIENT_ID
--    - PAYPAL_CLIENT_SECRET
--    - PAYPAL_MODE (sandbox or live)
--    - PAYPAL_WEBHOOK_ID (optional, for signature verification)

