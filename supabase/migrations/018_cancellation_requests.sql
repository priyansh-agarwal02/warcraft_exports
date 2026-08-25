-- ============================================================
-- WARCRAFT EXPORTS — Customer Cancellation Requests Migration
-- ============================================================
-- Description: Adds columns for customer-initiated order cancellation requests
-- requiring seller admin approval or rejection with reason tracking.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancellation_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_request_status TEXT CHECK (cancellation_request_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS cancellation_rejection_reason TEXT;

-- Comments for documentation
COMMENT ON COLUMN public.orders.cancellation_requested IS 'Flag indicating if the customer requested order cancellation.';
COMMENT ON COLUMN public.orders.customer_cancellation_reason IS 'Mandatory reason provided by customer when requesting cancellation.';
COMMENT ON COLUMN public.orders.cancellation_request_status IS 'Status of customer cancellation request: pending, approved, rejected.';
COMMENT ON COLUMN public.orders.cancellation_rejection_reason IS 'Reason entered by admin when rejecting a customer cancellation request.';

-- ROLLBACK INSTRUCTION:
-- ALTER TABLE public.orders 
-- DROP COLUMN IF EXISTS cancellation_requested,
-- DROP COLUMN IF EXISTS customer_cancellation_reason,
-- DROP COLUMN IF EXISTS cancellation_request_status,
-- DROP COLUMN IF EXISTS cancellation_rejection_reason;
