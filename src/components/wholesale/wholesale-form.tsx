"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

interface WholesaleFormProps {
  onSubmit: (data: {
    name: string
    company: string
    country: string
    email: string
    phone: string
    categories: string[]
    volume: string
    message: string
  }) => Promise<{ success: boolean; error?: string }>
}

const PRODUCT_CATEGORIES = [
  "US Gear",
  "German Gear",
  "British Gear",
  "Japanese Gear",
  "Soviet Gear",
  "All Nations",
]

const VOLUME_OPTIONS = [
  "10–50 units (Low MOQ Tier)",
  "50–200 units",
  "200–500 units",
  "500–1,000 units",
  "1,000+ units (Bulk Order)",
]

const INPUT =
  "w-full border border-khaki/60 bg-parchment/60 rounded-sm px-3 py-2 font-sans text-sm text-leather-dark placeholder-khaki focus:outline-none focus:border-leather transition-colors"

export function WholesaleForm({ onSubmit }: WholesaleFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    company: "",
    country: "",
    email: "",
    phone: "",
    volume: "",
    message: "",
  })

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleCategoryChange = (cat: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, cat])
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== cat))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.name.trim() || !form.country.trim() || !form.email.trim() || !form.phone.trim() || !form.volume) {
      setError("Please fill in all required fields.")
      return
    }

    if (selectedCategories.length === 0) {
      setError("Please select at least one product category of interest.")
      return
    }

    startTransition(async () => {
      try {
        const res = await onSubmit({
          ...form,
          categories: selectedCategories,
        })
        if (res.success) {
          setSuccess(true)
          setForm({
            name: "",
            company: "",
            country: "",
            email: "",
            phone: "",
            volume: "",
            message: "",
          })
          setSelectedCategories([])
        } else {
          setError(res.error || "Failed to submit wholesale inquiry. Please try again.")
        }
      } catch (err: any) {
        console.error(err)
        setError("A network error occurred. Please try again.")
      }
    })
  }

  return (
    <div id="wholesale-inquiry-form" className="border-2 border-leather rounded-sm bg-white p-6 sm:p-8 shadow-md">
      <h2 className="font-heading text-2xl sm:text-3xl text-leather-dark font-bold mb-1">Wholesale Inquiry Form</h2>
      <p className="font-sans text-xs text-leather/70 mb-6">
        Direct Factory Pricing for Reenactor Groups, Museums, Film Prop Directors &amp; Retailers.
      </p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-sans rounded-sm font-medium">
          Thank you! Your wholesale inquiry has been submitted successfully. Our team will review your application and respond within 24 Hours.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-sans rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
              value={form.name}
              onChange={handleChange}
              className={INPUT}
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
              Company / Group Name
            </label>
            <input
              id="company"
              name="company"
              type="text"
              disabled={isPending}
              value={form.company}
              onChange={handleChange}
              className={INPUT}
              placeholder="Your Business or Reenactment Club"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
              Country *
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              disabled={isPending}
              value={form.country}
              onChange={handleChange}
              className={INPUT}
              placeholder="United States"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isPending}
              value={form.email}
              onChange={handleChange}
              className={INPUT}
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
            Phone Number *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            disabled={isPending}
            value={form.phone}
            onChange={handleChange}
            className={INPUT}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Product category checkboxes */}
        <div>
          <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-2">
            Product Categories of Interest *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRODUCT_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={isPending}
                  checked={selectedCategories.includes(cat)}
                  onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                  className="w-4 h-4 accent-leather rounded-xs"
                />
                <span className="font-sans text-xs text-leather-dark group-hover:text-leather transition-colors font-medium">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Volume select */}
        <div>
          <label htmlFor="volume" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
            Estimated Order Volume (MOQ 10+ Units) *
          </label>
          <select
            id="volume"
            name="volume"
            required
            disabled={isPending}
            value={form.volume}
            onChange={handleChange}
            className="w-full border border-khaki/60 bg-parchment/60 rounded-sm px-3 py-2 font-sans text-sm text-leather-dark focus:outline-none focus:border-leather"
          >
            <option value="">Select an order volume range</option>
            {VOLUME_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
            Requirements / Mix &amp; Match Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            disabled={isPending}
            value={form.message}
            onChange={handleChange}
            className="w-full border border-khaki/60 bg-parchment/60 rounded-sm px-3 py-2 font-sans text-sm text-leather-dark placeholder-khaki focus:outline-none focus:border-leather resize-none"
            placeholder="Specify SKUs, quantities, or custom requirements..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#33450D] text-white hover:bg-[#27350A] font-sans font-bold text-sm uppercase tracking-widest py-3.5 rounded-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {isPending && <Loader2 className="animate-spin" size={14} />}
          {isPending ? "Submitting Inquiry..." : "Submit Wholesale Inquiry"}
        </button>

        <p className="text-center font-sans text-[11px] text-khaki">
          Direct response within 24 hours · Confidential B2B Pricing
        </p>
      </form>
    </div>
  )
}
