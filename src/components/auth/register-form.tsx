"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Script from "next/script"
import { PhoneInput } from "@/components/ui/phone-input"
import { COUNTRY_PREFIXES } from "@/lib/phone"

interface RegisterFormProps {
  defaultCountry?: string
}

export function RegisterForm({ defaultCountry = "US" }: RegisterFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [countryCode, setCountryCode] = useState("US")
  const [phonePrefix, setPhonePrefix] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Initialize values based on defaultCountry prop
  useEffect(() => {
    const matched = COUNTRY_PREFIXES.find(c => c.code === defaultCountry) || COUNTRY_PREFIXES.find(c => c.code === "US")!
    setCountryCode(matched.code)
    setPhonePrefix(matched.prefix)
  }, [defaultCountry])

  // Explicitly render the Turnstile widget
  useEffect(() => {
    let intervalId: any

    const tryRender = () => {
      if (typeof window !== "undefined" && (window as any).turnstile) {
        try {
          (window as any).turnstile.render("#turnstile-widget", {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
            callback: (token: string) => {
              setTurnstileToken(token)
            },
            "expired-callback": () => {
              setTurnstileToken("")
            },
            "error-callback": () => {
              setTurnstileToken("")
            },
          })
          clearInterval(intervalId)
        } catch {
          // Container might not be ready yet, retry on next interval
        }
      }
    }

    intervalId = setInterval(tryRender, 200)
    return () => clearInterval(intervalId)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.")
      return
    }

    if (!turnstileToken) {
      setError("Please complete the security check.")
      return
    }

    setLoading(true)

    try {
      const fullPhoneNumber = `${phonePrefix}${phoneNumber.trim().replace(/\s+/g, "")}`

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone: fullPhoneNumber,
          turnstileToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create account.")
        if ((window as any).turnstile) {
          (window as any).turnstile.reset("#turnstile-widget")
        }
        setTurnstileToken("")
        setLoading(false)
        return
      }

      // Automatically send the welcome email on success
      fetch("/api/auth/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email }),
      }).catch(() => null)

      setSuccess(true)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-canvas border border-khaki/30 rounded-sm p-8 w-full max-w-md mx-auto mt-16 text-center">
        <h1 className="font-heading text-2xl text-leather-dark mb-4">Check Your Email</h1>
        <p className="text-sm font-sans text-leather-dark/80 mb-6">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please check your inbox to activate your account.
        </p>
        <Link
          href="/auth/login"
          className="text-sm font-sans text-leather hover:text-leather-dark transition-colors font-semibold"
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-canvas border border-khaki/30 rounded-sm p-8 w-full max-w-md mx-auto mt-16">
      {/* Cloudflare Turnstile script */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />

      <h1 className="font-heading text-2xl text-leather-dark mb-6">Create Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="full-name" className="text-xs font-sans font-semibold uppercase tracking-widest text-leather-dark">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki"
            placeholder="Your full name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-sans font-semibold uppercase tracking-widest text-leather-dark">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki"
            placeholder="you@example.com"
          />
        </div>

        {/* Phone number prefix + digits */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-xs font-sans font-semibold uppercase tracking-widest text-leather-dark">
            Phone / WhatsApp
          </label>
          <PhoneInput
            id="phone"
            required={true}
            countryCode={countryCode}
            numberValue={phoneNumber}
            onCountryChange={(code, prefix) => {
              setCountryCode(code)
              setPhonePrefix(prefix)
            }}
            onNumberChange={setPhoneNumber}
            placeholder="555 000 0000"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-sans font-semibold uppercase tracking-widest text-leather-dark">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki"
            placeholder="Min. 6 characters"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-xs font-sans font-semibold uppercase tracking-widest text-leather-dark">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki"
            placeholder="Repeat password"
          />
        </div>

        {/* Cloudflare Turnstile Container */}
        <div className="my-2 flex justify-center min-h-[65px]">
          <div id="turnstile-widget"></div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-sans">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-leather text-parchment text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs font-sans text-khaki">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-leather hover:text-leather-dark transition-colors font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
