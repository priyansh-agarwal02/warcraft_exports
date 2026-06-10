"use client"

import { useState } from "react"

async function subscribeNewsletter(email: string) {
  const res = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  return res.ok
}

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    try {
      const ok = await subscribeNewsletter(email)
      setStatus(ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="mb-5 px-3 py-2.5 bg-gold/10 border border-gold/30 text-[12px] font-sans text-gold">
        Thanks! You&apos;re subscribed.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="flex-1 px-3 py-2 text-xs bg-white/10 border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2 bg-gold text-leather-dark text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "…" : "Join"}
      </button>
    </form>
  )
}
