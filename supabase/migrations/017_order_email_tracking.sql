-- ============================================================
-- WARCRAFT EXPORTS — Order Email Tracking & Idempotency Migration
-- ============================================================
-- Description: Adds tracking timestamps for email dispatches and cancellation reasons
-- to prevent duplicate email triggers and maintain idempotent order processing.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipped_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Comments for documentation
COMMENT ON COLUMN public.orders.shipped_email_sent_at IS 'Timestamp of when the order shipped notification email was dispatched to customer.';
COMMENT ON COLUMN public.orders.delivered_email_sent_at IS 'Timestamp of when the order delivered notification email was dispatched to customer.';
COMMENT ON COLUMN public.orders.cancelled_email_sent_at IS 'Timestamp of when the order cancelled notification email was dispatched to customer.';
COMMENT ON COLUMN public.orders.cancellation_reason IS 'Reason entered by admin when cancelling the order.';

-- ROLLBACK INSTRUCTION:
-- ALTER TABLE public.orders 
-- DROP COLUMN IF EXISTS shipped_email_sent_at,
-- DROP COLUMN IF EXISTS delivered_email_sent_at,
-- DROP COLUMN IF EXISTS cancelled_email_sent_at,
-- DROP COLUMN IF EXISTS cancellation_reason;
