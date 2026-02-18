-- Migration: Add RLS policies to question_sets table
-- Free samples: accessible to all users (including anonymous)
-- Paid question sets: only accessible to users with an active subscription

-- Enable RLS (no-op if already enabled)
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;

-- Free sample question sets are accessible to everyone
CREATE POLICY "Anyone can read free sample question sets"
  ON public.question_sets
  FOR SELECT
  USING (is_free_sample = true);

-- Paid question sets are only accessible to users with an active subscription
CREATE POLICY "Subscribed users can read paid question sets"
  ON public.question_sets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_subscriptions
      WHERE user_subscriptions.user_id = auth.uid()
        AND user_subscriptions.status = 'active'
    )
  );
