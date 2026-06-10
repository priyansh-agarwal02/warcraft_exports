"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function UpdatePasswordForm() {
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

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-canvas border border-khaki/30 rounded-sm p-8 w-full max-w-md mx-auto mt-16 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl text-leather-dark mb-3 uppercase tracking-wide font-black">Password Updated</h1>
        <p className="text-sm font-sans text-leather-dark/85 mb-8">
          Your account password has been successfully updated. You can now use your new credentials to sign in.
        </p>
        <Link
          href="/auth/login"
          className="inline-block w-full py-3 bg-leather text-parchment text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-canvas border border-khaki/30 rounded-sm p-8 w-full max-w-md mx-auto mt-16 shadow-sm">
      <h1 className="font-heading text-2xl text-leather-dark mb-2 uppercase tracking-wide font-black">Update Password</h1>
      <p className="text-sm font-sans text-leather-dark/70 mb-6">
        Please enter your new secure password below to update your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-sans font-bold uppercase tracking-widest text-leather-dark">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki transition-colors"
            placeholder="Min. 6 characters"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-xs font-sans font-bold uppercase tracking-widest text-leather-dark">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki transition-colors"
            placeholder="Repeat your new password"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-sans font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-leather text-parchment text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-leather-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
        >
          {loading ? "Updating password…" : "Save New Password"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs font-sans text-khaki">
        Changed your mind?{" "}
        <Link href="/account/settings" className="text-leather hover:text-leather-dark transition-colors font-bold uppercase tracking-wider text-[10px]">
          Back to Settings
        </Link>
      </p>
    </div>
  )
}
