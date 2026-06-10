"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-canvas border border-khaki/30 rounded-sm p-8 w-full max-w-md mx-auto mt-16 text-center">
        <h1 className="font-heading text-2xl text-leather-dark mb-4">Email Sent</h1>
        <p className="text-sm font-sans text-leather-dark/80 mb-6">
          Password reset email sent. Please check your inbox and follow the link to reset your password.
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
      <h1 className="font-heading text-2xl text-leather-dark mb-2">Reset Password</h1>
      <p className="text-sm font-sans text-leather-dark/70 mb-6">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        {error && (
          <p className="text-red-600 text-sm font-sans">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-leather text-parchment text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Sending…" : "Send Reset Email"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs font-sans text-khaki">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-leather hover:text-leather-dark transition-colors font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
