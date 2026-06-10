"use server"

import { createServiceClient } from "@/lib/supabase/service"

export type CouponResult = {
  success: boolean
  error?: string
  coupon?: {
    id: string
    code: string
    type: "percent" | "fixed" | "free_shipping"
    value: number
    min_order_usd: number | null
    usage_limit: number | null
    times_used: number
  }
}

export async function validateCouponAction(code: string, subtotal: number): Promise<CouponResult> {
  const cleanCode = code.toUpperCase().trim()
  if (!cleanCode) {
    return { success: false, error: "Please enter a coupon code." }
  }

  try {
    const supabase = createServiceClient()
    
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("id, code, type, value, min_order_usd, usage_limit, times_used, is_active, expires_at")
      .ilike("code", cleanCode)
      .maybeSingle()

    if (error || !coupon) {
      return { success: false, error: "Invalid coupon code." }
    }

    if (!coupon.is_active) {
      return { success: false, error: "This coupon is no longer active." }
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { success: false, error: "This coupon has expired." }
    }

    if (coupon.min_order_usd && subtotal < Number(coupon.min_order_usd)) {
      return { 
        success: false, 
        error: `This coupon requires a minimum order of $${Number(coupon.min_order_usd).toFixed(2)}.` 
      }
    }

    if (coupon.usage_limit && (coupon.times_used ?? 0) >= coupon.usage_limit) {
      return { success: false, error: "This coupon's usage limit has been reached." }
    }

    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type as "percent" | "fixed" | "free_shipping",
        value: Number(coupon.value),
        min_order_usd: coupon.min_order_usd ? Number(coupon.min_order_usd) : null,
        usage_limit: coupon.usage_limit,
        times_used: coupon.times_used ?? 0,
      }
    }
  } catch (err: any) {
    console.error("validateCouponAction error:", err)
    return { success: false, error: "Failed to validate coupon due to internal error." }
  }
}
