import { describe, expect, it } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import { computeOrderPricing } from "@/lib/orders/pricing"
import { createSupabaseMock } from "./supabase-mock"

const P1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const product = { id: P1, name: "Leather Pouch", sku: "WE-001", price_usd: 38.99, sale_price_usd: null, stock_quantity: 10, ships_from_usa: false }
const rate = { standard_price: 9.99, free_threshold: 50, express_price: 35 }

function run(results: Parameters<typeof createSupabaseMock>[0], input: Partial<Parameters<typeof computeOrderPricing>[1]> = {}) {
  const mock = createSupabaseMock({ products: { data: [product] }, shipping_rates: { data: rate }, ...results })
  const result = computeOrderPricing(mock.client as unknown as SupabaseClient, {
    items: [{ productId: P1, variantId: null, quantity: 1 }],
    country: "United States",
    ...input,
  })
  return { result, mock }
}

describe("computeOrderPricing", () => {
  it("charges standard shipping under the free-shipping threshold", async () => {
    const { result } = run({})
    const r = await result
    expect(r.ok && r.total).toBe(48.98) // 38.99 + 9.99
  })

  it("gives free standard shipping at or above the threshold", async () => {
    const { result } = run({}, { items: [{ productId: P1, variantId: null, quantity: 2 }] })
    const r = await result
    expect(r.ok && r.shipping).toBe(0)
    expect(r.ok && r.total).toBe(77.98)
  })

  it("applies a percent coupon", async () => {
    const { result } = run(
      { coupons: { data: { id: "c1", code: "SAVE10", type: "percent", value: 10, min_order_usd: null, usage_limit: null, times_used: 0, is_active: true, expires_at: null } }, orders: { count: 0 } },
      { couponCode: "save10", items: [{ productId: P1, variantId: null, quantity: 2 }] }
    )
    const r = await result
    expect(r.ok && r.discountUsd).toBe(7.8)
    expect(r.ok && r.total).toBe(70.18)
  })

  it("escapes LIKE wildcards so '%' cannot match a real coupon", async () => {
    const { result, mock } = run({ coupons: { data: null } }, { couponCode: "%" })
    await result
    const ilike = mock.calls.find((c) => c.table === "coupons" && c.method === "ilike")
    expect(ilike?.args[1]).toBe("\\%")
  })

  it("refuses more than the available stock", async () => {
    const { result } = run({ products: { data: [{ ...product, stock_quantity: 1 }] } }, { items: [{ productId: P1, variantId: null, quantity: 3 }] })
    const r = await result
    expect(r.ok).toBe(false)
  })

  it("rejects invalid product ids before touching the database", async () => {
    const { result, mock } = run({}, { items: [{ productId: "1 OR 1=1", variantId: null, quantity: 1 }] })
    const r = await result
    expect(r.ok).toBe(false)
    expect(mock.client.from).not.toHaveBeenCalled()
  })

  it("applies 'Buy 2+ save 5%' exactly like the cart page ($74.08 for 2 × $38.99)", async () => {
    const promo = { id: "p1", name: "Buy 2 Save EXTRA 5%", description: "", min_quantity: 2, discount_percent: 5, applies_to: "all", product_ids: [], is_active: true, expires_at: null, created_at: "2026-01-01" }
    const { result } = run({ quantity_promotions: { data: [promo] } }, { items: [{ productId: P1, variantId: null, quantity: 2 }] })
    const r = await result
    expect(r.ok && r.quantityDiscountUsd).toBe(3.9)
    expect(r.ok && r.total).toBe(74.08)
    expect(r.ok && r.quantityPromotionName).toBe("Buy 2 Save EXTRA 5%")
  })

  it("does not apply the promotion to a single item or when it has expired", async () => {
    const promo = { id: "p1", name: "Buy 2", description: "", min_quantity: 2, discount_percent: 5, applies_to: "all", product_ids: [], is_active: true, expires_at: null, created_at: "2026-01-01" }
    const single = await run({ quantity_promotions: { data: [promo] } }).result
    expect(single.ok && single.quantityDiscountUsd).toBe(0)
    const expired = await run({ quantity_promotions: { data: [{ ...promo, expires_at: "2020-01-01T00:00:00Z" }] } }, { items: [{ productId: P1, variantId: null, quantity: 2 }] }).result
    expect(expired.ok && expired.quantityDiscountUsd).toBe(0)
  })

  it("combines a coupon and the quantity promotion the same way the cart does", async () => {
    const promo = { id: "p1", name: "Buy 2", description: "", min_quantity: 2, discount_percent: 5, applies_to: "all", product_ids: [], is_active: true, expires_at: null, created_at: "2026-01-01" }
    const { result } = run(
      {
        quantity_promotions: { data: [promo] },
        coupons: { data: { id: "c1", code: "SAVE10", type: "percent", value: 10, min_order_usd: null, usage_limit: null, times_used: 0, is_active: true, expires_at: null } },
        orders: { count: 0 },
      },
      { couponCode: "SAVE10", items: [{ productId: P1, variantId: null, quantity: 2 }] }
    )
    const r = await result
    // subtotal 77.98 − coupon 7.80 − promo 3.90 + free shipping = 66.28
    expect(r.ok && r.total).toBe(66.28)
  })

  it("clamps silly quantities to 1–100", async () => {
    const { result } = run({ products: { data: [{ ...product, stock_quantity: null }] } }, { items: [{ productId: P1, variantId: null, quantity: -5 }] })
    const r = await result
    expect(r.ok && r.validatedItems[0].quantity).toBe(1)
  })
})
