import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { paymentCoversTotal, verifyPayPalPayment, verifyRazorpayPayment } from "@/lib/payments/gateways"

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = "test-client"
  process.env.PAYPAL_CLIENT_SECRET = "test-secret"
  process.env.RAZORPAY_KEY_ID = "rzp_test_x"
  process.env.RAZORPAY_KEY_SECRET = "secret"
})
afterEach(() => vi.unstubAllGlobals())

describe("paymentCoversTotal", () => {
  it("accepts an exact USD match", async () => {
    expect((await paymentCoversTotal(38.99, "USD", 38.99)).ok).toBe(true)
  })
  it("rejects a USD underpayment", async () => {
    expect((await paymentCoversTotal(0.01, "USD", 38.99)).ok).toBe(false)
  })
  it("converts non-USD amounts and allows small rate movement", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { rates: { INR: 83 } })))
    expect((await paymentCoversTotal(3236, "INR", 38.99)).ok).toBe(true) // 3236 / 83 = 38.99
    expect((await paymentCoversTotal(39, "INR", 38.99)).ok).toBe(false) // 39 rupees for a $38.99 order
  })
  it("never confirms when the exchange rate is unknown", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(500, {})))
    expect((await paymentCoversTotal(3236, "INR", 38.99)).ok).toBe(false)
  })
})

describe("verifyPayPalPayment", () => {
  const token = () => jsonResponse(200, { access_token: "tok" })

  it("rejects malformed ids without calling PayPal", async () => {
    const f = vi.fn()
    vi.stubGlobal("fetch", f)
    expect((await verifyPayPalPayment("<script>")).status).toBe("not_paid")
    expect(f).not.toHaveBeenCalled()
  })
  it("returns the captured amount for a completed order", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(jsonResponse(200, {
        status: "COMPLETED",
        purchase_units: [{ payments: { captures: [{ id: "CAP123", status: "COMPLETED", amount: { value: "38.99", currency_code: "USD" } }] } }],
      })))
    expect(await verifyPayPalPayment("5O190127TN364715T")).toEqual({ status: "paid", amount: 38.99, currency: "USD", captureId: "CAP123" })
  })
  it("rejects an approved-but-not-captured order", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(token()).mockResolvedValueOnce(jsonResponse(200, { status: "APPROVED", purchase_units: [{}] })))
    expect((await verifyPayPalPayment("5O190127TN364715T")).status).toBe("not_paid")
  })
  it("rejects an order PayPal doesn't know", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(token()).mockResolvedValueOnce(jsonResponse(404, {})))
    expect((await verifyPayPalPayment("5O190127TN364715T")).status).toBe("not_paid")
  })
  it("marks the payment unverifiable (not rejected) when PayPal is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(token()).mockResolvedValueOnce(jsonResponse(503, {})))
    expect((await verifyPayPalPayment("5O190127TN364715T")).status).toBe("unverifiable")
  })
})

describe("verifyRazorpayPayment", () => {
  it("returns the captured amount in major units", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { order_id: "order_ABC123", status: "captured", amount: 323600, currency: "INR" })))
    expect(await verifyRazorpayPayment("order_ABC123", "pay_XYZ789")).toEqual({ status: "paid", amount: 3236, currency: "INR", captureId: "pay_XYZ789" })
  })
  it("rejects a payment that belongs to a different order", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { order_id: "order_OTHER1", status: "captured", amount: 100, currency: "INR" })))
    expect((await verifyRazorpayPayment("order_ABC123", "pay_XYZ789")).status).toBe("not_paid")
  })
  it("rejects failed payments", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { order_id: "order_ABC123", status: "failed", amount: 100, currency: "INR" })))
    expect((await verifyRazorpayPayment("order_ABC123", "pay_XYZ789")).status).toBe("not_paid")
  })
  it("keeps authorized-but-not-yet-captured payments for review instead of rejecting", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(200, { order_id: "order_ABC123", status: "authorized", amount: 100, currency: "INR" })))
    expect((await verifyRazorpayPayment("order_ABC123", "pay_XYZ789")).status).toBe("unverifiable")
  })
  it("rejects malformed ids", async () => {
    expect((await verifyRazorpayPayment("x", "y")).status).toBe("not_paid")
  })
})

describe("PayPal pending captures", () => {
  it("treats a PENDING capture (eCheck / review) as unverifiable, not unpaid", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: "COMPLETED",
        purchase_units: [{ payments: { captures: [{ id: "CAP9", status: "PENDING", amount: { value: "38.99", currency_code: "USD" } }] } }],
      }), { status: 200 })))
    expect((await verifyPayPalPayment("5O190127TN364715T")).status).toBe("unverifiable")
  })
})

describe("store credential failures are refused, never 'pending'", () => {
  it("PayPal rejecting our credentials → not_paid", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })))
    expect((await verifyPayPalPayment("5O190127TN364715T")).status).toBe("not_paid")
  })
  it("PayPal unreachable → unverifiable (kept for review)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network") }))
    expect((await verifyPayPalPayment("5O190127TN364715T")).status).toBe("unverifiable")
  })
  it("Razorpay rejecting our keys (401) → not_paid — the exact case found in live testing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })))
    expect((await verifyRazorpayPayment(null, "pay_FAKE1234567")).status).toBe("not_paid")
  })
  it("Razorpay server error (503) → unverifiable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 503 })))
    expect((await verifyRazorpayPayment("order_ABC123", "pay_XYZ789")).status).toBe("unverifiable")
  })
})
