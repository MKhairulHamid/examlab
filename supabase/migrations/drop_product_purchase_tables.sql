-- Migration: Remove product purchase tables (subscription-only model)
-- Drops user_purchases and packages tables. Run after confirming no purchase data is needed.

-- 1. Drop user_purchases first (has FK to packages)
DROP TABLE IF EXISTS public.user_purchases CASCADE;

-- 2. Drop packages table (purchase bundles - no longer used with subscription model)
DROP TABLE IF EXISTS public.packages CASCADE;
