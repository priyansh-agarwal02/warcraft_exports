-- Atomic coupon usage increment
-- Prevents race condition where concurrent checkouts bypass usage_limit
-- Rollback: DROP FUNCTION IF EXISTS increment_coupon_usage(UUID);

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_uuid UUID)
RETURNS VOID AS $$
  UPDATE coupons
  SET times_used = COALESCE(times_used, 0) + 1
  WHERE id = coupon_uuid;
$$ LANGUAGE sql;
