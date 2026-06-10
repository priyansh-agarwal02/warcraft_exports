"use client"
import { useEffect, useState } from "react"

interface RazorpayButtonProps {
  totalUsd: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  onSuccess: (paymentId: string) => void
  onError: (msg?: string) => void
  onProcessing?: (state: "verifying" | "recording" | "redirecting" | null) => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      let resolved = false
      const handleLoad = () => {
        if (resolved) return
        resolved = true
        resolve(true)
      }
      const handleError = () => {
        if (resolved) return
        resolved = true
        existing.remove()
        
        // Retry with a fresh script tag
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.head.appendChild(script)
      }

      existing.addEventListener("load", handleLoad)
      existing.addEventListener("error", handleError)

      // Fallback: if the script is stale (listeners won't fire), trigger re-injection after 500ms
      setTimeout(() => {
        if (resolved) return
        resolved = true
        existing.remove()

        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.head.appendChild(script)
      }, 500)
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

export function RazorpayButton({
  totalUsd, currency, customerName, customerEmail, customerPhone, onSuccess, onError, onProcessing,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js")
  }, [])

  async function openRazorpay() {
    setLoading(true)
    try {
      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
      if (!loaded || !window.Razorpay) {
        onError("Failed to load the Razorpay payment gateway. Please check your internet connection and try again.")
        return
      }

      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalUsd, currency }),
      })

      const data = await res.json()

      if (!res.ok || !data.orderId) {
        const errorMsg = data.error ?? "Unable to create payment order. Please contact support."
        onError(errorMsg)
        return
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Warcraft Exports",
        description: "Historical Reproduction Gear",
        image: "/logo.png",
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          setLoading(true)
          onProcessing?.("verifying")
          try {
            // Verify signature server-side
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verified = await verifyRes.json()
            if (verified.verified) {
              onProcessing?.("recording")
              onSuccess(response.razorpay_payment_id)
            } else {
              onProcessing?.(null)
              onError("Payment verification failed. Please contact support@warcraftexports.com.")
            }
          } catch (err: any) {
            onProcessing?.(null)
            onError(err?.message ?? "An error occurred during verification. Please contact support.")
          } finally {
            setLoading(false)
          }
        },
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        theme: { color: "#3B2A1A" },
        modal: { 
          ondismiss: () => { 
            setLoading(false)
            onProcessing?.(null)
            onError("Payment was cancelled or closed by user.") 
          } 
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: any) {
      onError(err?.message ?? "Payment error. Please try again or contact support.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={openRazorpay}
      disabled={loading}
      className="w-full h-11 px-6 bg-[#002970] hover:bg-[#001f54] active:bg-[#001538] text-white text-xs font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 rounded-sm disabled:opacity-60 shadow-sm border-0 cursor-pointer"
    >
      <svg className="w-[18px] h-[18px] fill-white shrink-0 animate-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
      </svg>
      {loading ? "PREPARING..." : "RAZORPAY SECURED CHECKOUT"}
    </button>
  )
}
