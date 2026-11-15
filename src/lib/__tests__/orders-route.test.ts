// End-to-end tests of POST /api/orders with the database, email and payment gateways simulated.
// Proves an order can only be confirmed with a real, matching payment.
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { createSupabaseMock, type Call } from "./supabase-mock"

const P1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
let db: ReturnType<typeof createSupabaseMock>
let reuseCount = 0

const verifyPayPal = vi.fn()
const verifyRazorpay = vi.fn()
const verifyCapture = vi.fn()
const sendAlert = vi.fn()
const sendConfirmation = vi.fn()

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => db.client }))
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => db.client }))
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: async () => true }))
vi.mock("@/lib/email", () => ({
  sendOrderConfirmation: (...a: unknown[]) => sendConfirmation(...a),
  sendGuestWelcomeEmail: vi.fn(),
  sendPaymentReviewAlert: (...a: unknown[]) => sendAlert(...a),
}))
vi.mock("@/lib/payments/gateways", async (orig) => {
  const real = await orig<typeof import("@/lib/payments/gateways")>()
  return {
    ...real,
    verifyPayPalPayment: (...a: unknown[]) => verifyPayPal(...a),
    verifyRazorpayPayment: (...a: unknown[]) => verifyRazorpay(...a),
    verifyPayPalCapture: (...a: unknown[]) => verifyCapture(...a),
  }
})

const { POST } = await import("@/app/api/orders/route")

const customer = {
  fullName: "Test Buyer", email: "buyer@example.com", phone: "+1 555 123 4567",
  address1: "1 Main St", city: "Austin", state: "TX", postalCode: "73301", country: "United States",
}

function req(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify({ customer, items: [{ productId: P1, variantId: null, quantity: 1 }], ...body }),
  })
}

function insertedOrder() {
  return db.inserts.find((i) => i.table === "orders")?.row as Record<string, unknown> | undefined
}

beforeEach(() => {
  vi.clearAllMocks()
  reuseCount = 0
  db = createSupabaseMock({
    products: { data: [{ id: P1, name: "Leather Pouch", sku: "WE-001", price_usd: 38.99, sale_price_usd: null, stock_quantity: 10, ships_from_usa: false }] },
    shipping_rates: { data: { standard_price: 9.99, free_threshold: 50, express_price: 35 } },
    profiles: { data: { id: "22222222-2222-4222-8222-222222222222" } },
    addresses: { data: null, count: 0 },
    orders: (calls: Call[]) => (calls.some((c) => c.method === "insert") ? { data: { id: "order-1" } } : { count: reuseCount }),
  })
})

describe("POST /api/orders", () => {
  it("refuses an order with no payment at all", async () => {
    const res = await POST(req({}))
    expect(res.status).toBe(402)
    expect(insertedOrder()).toBeUndefined()
  })

  it("refuses a fake / unpaid payment id", async () => {
    verifyPayPal.mockResolvedValue({ status: "not_paid", reason: "PayPal order not found" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "FAKE", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(402)
    expect(insertedOrder()).toBeUndefined()
    expect(sendConfirmation).not.toHaveBeenCalled()
  })

  it("confirms an order whose payment matches the server total", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(200)
    expect(insertedOrder()).toMatchObject({ status: "confirmed", total_usd: 48.98, payment_intent_id: "CAP123" })
    expect(sendAlert).not.toHaveBeenCalled()
  })

  it("keeps an underpaid order as pending review and alerts the owner (never confirmed)", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 0.01, currency: "USD", captureId: "CAP123" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(200)
    expect(insertedOrder()).toMatchObject({ status: "pending" })
    expect(String(insertedOrder()?.notes)).toContain("PAYMENT REVIEW")
    expect(sendAlert).toHaveBeenCalledOnce()
  })

  it("keeps the order (pending) when the gateway is temporarily unreachable", async () => {
    verifyRazorpay.mockResolvedValue({ status: "unverifiable", reason: "Razorpay unreachable" })
    const res = await POST(req({ paymentMethod: "razorpay", paymentIntentId: "pay_XYZ789", gatewayOrderId: "order_ABC123" }))
    expect(res.status).toBe(200)
    expect(insertedOrder()).toMatchObject({ status: "pending" })
  })

  it("refuses to reuse a payment that already created an order", async () => {
    reuseCount = 1
    verifyRazorpay.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "pay_XYZ789" })
    const res = await POST(req({ paymentMethod: "razorpay", paymentIntentId: "pay_XYZ789", gatewayOrderId: "order_ABC123" }))
    expect(res.status).toBe(409)
    expect(insertedOrder()).toBeUndefined()
  })

  it("refuses a PayPal capture id that doesn't belong to the PayPal order", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "SOMEONE_ELSES", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(402)
  })

  it("ignores a 'status' field sent by the browser", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 0.01, currency: "USD", captureId: "CAP123" })
    await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T", status: "confirmed" }))
    expect(insertedOrder()).toMatchObject({ status: "pending" })
  })

  it("escapes LIKE wildcards in the guest-account email lookup", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    await POST(new NextRequest("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { ...customer, email: "a_b@example.com" },
        items: [{ productId: P1, variantId: null, quantity: 1 }],
        paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T",
      }),
    }))
    const lookup = db.calls.find((c) => c.table === "profiles" && c.method === "ilike")
    expect(lookup?.args[1]).toBe("a\\_b@example.com")
  })
})

describe("POST /api/orders — a paying customer is never lost", () => {
  it("saves the order as pending (not rejected) when stock ran out after payment", async () => {
    db = createSupabaseMock({
      products: { data: [{ id: P1, name: "Leather Pouch", sku: "WE-001", price_usd: 38.99, sale_price_usd: null, stock_quantity: 0, ships_from_usa: false }] },
      shipping_rates: { data: { standard_price: 9.99, free_threshold: 50, express_price: 35 } },
      profiles: { data: { id: "22222222-2222-4222-8222-222222222222" } },
      addresses: { data: null, count: 0 },
      orders: (calls: Call[]) => (calls.some((c) => c.method === "insert") ? { data: { id: "order-1" } } : { count: 0 }),
    })
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(200)
    expect(insertedOrder()).toMatchObject({ status: "pending" })
    expect(String(insertedOrder()?.notes)).toContain("Low stock")
    expect(sendAlert).toHaveBeenCalledOnce()
  })

  it("alerts the owner with the payment id if the order truly can't be built", async () => {
    db = createSupabaseMock({ products: { data: [] }, orders: { count: 0 } })
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(400)
    expect(JSON.stringify(await res.json())).toContain("CAP123")
    expect(sendAlert).toHaveBeenCalledOnce()
  })

  it("does not reject a paid order over a suspected email typo", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    const res = await POST(new NextRequest("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { ...customer, email: "buyer@gmial.com" },
        items: [{ productId: P1, variantId: null, quantity: 1 }],
        paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T",
      }),
    }))
    expect(res.status).toBe(200)
    expect(insertedOrder()).toMatchObject({ status: "confirmed" })
  })
})

describe("POST /api/orders — checkouts started on the previous site version (during the update)", () => {
  it("accepts a PayPal payment that only has the capture id, verified directly with PayPal", async () => {
    verifyCapture.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123" }))
    expect(res.status).toBe(200)
    expect(verifyCapture).toHaveBeenCalledWith("CAP123")
    expect(insertedOrder()).toMatchObject({ status: "confirmed" })
  })

  it("accepts a Razorpay payment that only has the payment id", async () => {
    verifyRazorpay.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "pay_XYZ789" })
    const res = await POST(req({ paymentMethod: "razorpay", paymentIntentId: "pay_XYZ789" }))
    expect(res.status).toBe(200)
    expect(verifyRazorpay).toHaveBeenCalledWith(null, "pay_XYZ789")
  })

  it("still refuses a fake legacy payment id", async () => {
    verifyCapture.mockResolvedValue({ status: "not_paid", reason: "PayPal capture not found" })
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "FAKECAPTURE1" }))
    expect(res.status).toBe(402)
    expect(insertedOrder()).toBeUndefined()
  })

  it("alerts the owner if anything crashes after a verified payment", async () => {
    verifyPayPal.mockResolvedValue({ status: "paid", amount: 48.98, currency: "USD", captureId: "CAP123" })
    db.client.from = vi.fn((table: string) => { if (table === "products") throw new Error("db down"); return createSupabaseMock({ orders: { count: 0 } }).client.from(table) }) as typeof db.client.from
    const res = await POST(req({ paymentMethod: "paypal", paymentIntentId: "CAP123", gatewayOrderId: "5O190127TN364715T" }))
    expect(res.status).toBe(400)
    expect(sendAlert).toHaveBeenCalledOnce()
  })
})
