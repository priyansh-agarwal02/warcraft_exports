import type { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = {
  title: "Checkout — Warcraft Exports",
}

export default function CheckoutPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-2xl sm:text-3xl text-leather-dark mb-8">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  )
}
