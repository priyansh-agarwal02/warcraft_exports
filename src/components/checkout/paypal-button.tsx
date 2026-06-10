"use client"
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js"

interface PayPalButtonProps {
  totalUsd: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: {
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  onSuccess: (paymentId: string) => void
  onError: (msg?: string) => void
}

export function PayPalCheckout({
  totalUsd,
  currency,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test"

  // PayPal supported global currencies
  const PAYPAL_SUPPORTED_CURRENCIES = new Set([
    "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "NZD", "CHF", "HKD", "SGD", "SEK", "DKK", "PLN", "NOK", "MXN", "ILS"
  ])

  const activeCurrency = PAYPAL_SUPPORTED_CURRENCIES.has(currency.toUpperCase()) ? currency.toUpperCase() : "USD"

  const initialOptions = {
    clientId,
    currency: activeCurrency,
    components: "buttons",
    "enable-funding": "venmo",
  }

  async function createOrder() {
    try {
      const res = await fetch("/api/payment/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalUsd, currency: activeCurrency }),
      })
      const data = await res.json()
      if (!res.ok || !data.paypalOrderId) {
        throw new Error(data.error ?? "Failed to create PayPal order")
      }
      return data.paypalOrderId
    } catch (err: any) {
      console.error(err)
      onError(err?.message ?? "Failed to initiate PayPal checkout. Please try again.")
      throw err
    }
  }

  async function onApprove(data: { orderID: string }) {
    try {
      const res = await fetch("/api/payment/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalOrderId: data.orderID }),
      })
      const captured = await res.json()
      if (captured.captured) {
        onSuccess(captured.captureId ?? data.orderID)
      } else {
        onError("PayPal capture did not complete. Please check your account.")
      }
    } catch (err: any) {
      console.error(err)
      onError(err?.message ?? "PayPal transaction capture failed. Please contact support.")
    }
  }

  return (
    <div className="w-full border border-khaki/40 bg-canvas rounded-sm overflow-hidden shadow-sm relative z-0">
      {/* Tab Header styled in Warcraft Heritage scheme with single active tab */}
      <div className="flex border-b border-khaki/40">
        <div className="flex-1 py-3 text-center text-xs font-sans font-bold uppercase tracking-wider bg-parchment text-leather-dark border-b-2 border-b-leather">
          PayPal / Venmo
        </div>
      </div>

      {/* Main PayPal Script Wrapper */}
      <PayPalScriptProvider options={initialOptions} key={clientId + "-" + activeCurrency}>
        <div className="p-5 space-y-4">
          <p className="text-[11px] font-sans text-khaki leading-relaxed">
            Pay quickly and securely using your PayPal wallet, credit/debit card, or Venmo balance.
          </p>
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
              height: 44,
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.error("PayPal Express Error:", err)
              onError("An error occurred with PayPal Express checkout. Please try again.")
            }}
            onClick={(data, actions) => {
              const isValid =
                customerName.trim() &&
                customerEmail.trim() &&
                customerPhone.trim() &&
                customerAddress.address1.trim() &&
                customerAddress.city.trim() &&
                customerAddress.postalCode.trim()

              if (!isValid) {
                onError("Please fill in all contact and shipping address information fields before paying.")
                return actions.reject()
              }
              return actions.resolve()
            }}
          />
        </div>
      </PayPalScriptProvider>
    </div>
  )
}
