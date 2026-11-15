-- ==============================================================================
-- Migration: 023_unique_payment_intent_id.sql
-- Purpose: Guarantee one PayPal/Razorpay payment can only ever create one order.
--          (The API also checks this; the index makes it impossible even under a race.)
-- Safety: Checked 2026-11-15 — 10 existing orders, all with distinct payment ids.
--         Partial index: rows with NULL payment_intent_id are not affected.
-- Rollback: DROP INDEX IF EXISTS public.orders_payment_intent_id_unique;
-- ==============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_id_unique
  ON public.orders (payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;
