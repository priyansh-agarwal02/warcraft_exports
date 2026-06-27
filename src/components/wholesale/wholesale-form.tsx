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
  "Under 100 units",
  "100–500 units",
  "500–1,000 units",
  "1,000+ units",
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
    <div className="border border-khaki/50 rounded-sm bg-white/50 p-8">
      <h2 className="font-heading text-2xl text-leather-dark mb-1">Wholesale Enquiry Form</h2>
      <p className="font-sans text-xs text-leather/60 mb-8">
        Wholesale is enquiry-only. Our team will follow up with pricing and availability.
      </p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-sans rounded-sm">
          Thank you! Your wholesale inquiry has been submitted successfully. Our B2B team will review your application and respond within 24 Hours.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-sans rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
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
            <label htmlFor="company" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
              Company Name
            </label>
            <input
              id="company"
              name="company"
              type="text"
              disabled={isPending}
              value={form.company}
              onChange={handleChange}
              className={INPUT}
              placeholder="Your Company Ltd."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="country" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
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
            <label htmlFor="email" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
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
          <label htmlFor="phone" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
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
          <label className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-3">
            Product Categories of Interest *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRODUCT_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={isPending}
                  checked={selectedCategories.includes(cat)}
                  onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                  className="w-4 h-4 accent-leather rounded-sm"
                />
                <span className="font-sans text-sm text-leather-dark group-hover:text-leather transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Volume select */}
        <div>
          <label htmlFor="volume" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
            Estimated Monthly Volume *
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
            <option value="">Select a range</option>
            {VOLUME_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-leather mb-2">
            Additional Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            disabled={isPending}
            value={form.message}
            onChange={handleChange}
            className="w-full border border-khaki/60 bg-parchment/60 rounded-sm px-3 py-2 font-sans text-sm text-leather-dark placeholder-khaki focus:outline-none focus:border-leather resize-none"
            placeholder="Tell us about your business and what you're looking for..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-leather text-parchment font-sans font-semibold text-sm uppercase tracking-widest py-3 rounded-sm hover:bg-leather-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending && <Loader2 className="animate-spin" size={14} />}
          {isPending ? "Submitting..." : "Submit Enquiry"}
        </button>

        <p className="text-center font-sans text-[11px] text-khaki">
          We typically respond within 24 Hours. No automated replies — a human reads every enquiry.
        </p>
      </form>
    </div>
  )
}
