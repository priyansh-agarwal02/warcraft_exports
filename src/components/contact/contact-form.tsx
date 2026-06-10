"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

interface ContactFormProps {
  onSubmit: (name: string, email: string, subject: string, message: string) => Promise<{ success: boolean; error?: string }>
}

const INPUT =
  "w-full border border-khaki/60 bg-parchment/60 px-3 py-2.5 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather transition-colors"

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("All fields are required.")
      return
    }

    startTransition(async () => {
      try {
        const res = await onSubmit(form.name, form.email, form.subject, form.message)
        if (res.success) {
          setSuccess(true)
          setForm({ name: "", email: "", subject: "", message: "" })
        } else {
          setError(res.error || "Failed to submit message. Please try again.")
        }
      } catch (err: any) {
        console.error(err)
        setError("A network error occurred. Please try again.")
      }
    })
  }

  return (
    <div className="bg-white/50 border border-khaki/40 p-8">
      <h2 className="font-heading text-xl font-black text-leather-dark uppercase mb-6">
        Send a Message
      </h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-sans rounded-sm">
          Thank you! Your message has been sent successfully. We will get back to you within 2 business days.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-sans rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
              Your Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isPending}
              value={form.name}
              onChange={handleChange}
              placeholder="John Smith"
              className={INPUT}
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
              placeholder="you@email.com"
              className={INPUT}
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
            Subject *
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            disabled={isPending}
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Order enquiry — WE-045"
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            disabled={isPending}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us how we can help..."
            className={`${INPUT} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-leather text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.15em] py-3.5 hover:bg-leather-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending && <Loader2 className="animate-spin" size={14} />}
          {isPending ? "Sending..." : "Send Message"}
        </button>

        <p className="text-center font-sans text-[11px] text-khaki">
          We respond within 2 business days. No automated replies.
        </p>
      </form>
    </div>
  )
}
