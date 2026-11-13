"use client"

import { useState, useRef } from "react"
import { createTimeToken } from "@/lib/anti-bot"

async function subscribeNewsletter(
  email: string,
  timeToken: string,
  honeypotWebsite?: string,
  honeypotRole?: string,
  honeypotLegacy?: string
) {
  const res = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      _t: timeToken,
      user_website_url: honeypotWebsite || "",
      organization_role: honeypotRole || "",
      b_website: honeypotLegacy || "",
    }),
  })
  return res.ok
}

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [honeypotWebsite, setHoneypotWebsite] = useState("")
  const [honeypotRole, setHoneypotRole] = useState("")
  const [honeypotLegacy, setHoneypotLegacy] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const mountTimeRef = useRef<number>(Date.now())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    try {
      const ok = await subscribeNewsletter(
        email,
        createTimeToken(mountTimeRef.current),
        honeypotWebsite,
        honeypotRole,
        honeypotLegacy
      )
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
    <form onSubmit={handleSubmit} className="flex gap-2 mb-5 relative">
      {/* 🍯 Invisible Deceptive Honeypot Trap (Off-screen coordinates trap headless bots without display:none) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0.01,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <input
          type="text"
          name="user_website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotWebsite}
          onChange={(e) => setHoneypotWebsite(e.target.value)}
        />
        <input
          type="text"
          name="organization_role"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotRole}
          onChange={(e) => setHoneypotRole(e.target.value)}
        />
        <input
          type="text"
          name="b_website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotLegacy}
          onChange={(e) => setHoneypotLegacy(e.target.value)}
        />
      </div>

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
