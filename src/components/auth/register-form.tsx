"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function RegisterForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      fetch("/api/auth/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email }),
      }).catch(() => null)
    }

    setSuccess(true)
    setLoading(false)
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
