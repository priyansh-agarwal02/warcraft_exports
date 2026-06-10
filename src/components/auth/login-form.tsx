"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      setError(authError?.message ?? "Authentication failed")
      setLoading(false)
      return
    }

    // Query profiles to get the user's role and email
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", authData.user.id)
      .single()

    const searchParams = new URLSearchParams(window.location.search)
    const redirectTo = searchParams.get("redirectTo")

    if (profile?.role === "admin") {
      // Admins are allowed to go to /admin or anywhere else
      window.location.href = redirectTo || "/admin"
    } else {
      // Normal customers can never redirect to /admin routes even if requested
      if (redirectTo && !redirectTo.startsWith("/admin")) {
        window.location.href = redirectTo
      } else {
        window.location.href = "/account"
      }
    }
    // Note: setLoading(false) isn't strictly necessary here because the page will navigate away,
    // but we can add a small timeout to clear loading just in case navigation is slow.
    setTimeout(() => setLoading(false), 3000);
  }

  return (
    <div className="bg-canvas border border-khaki/30 rounded-sm p-8 w-full max-w-md mx-auto mt-16">
      <h1 className="font-heading text-2xl text-leather-dark mb-6">Sign In</h1>

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
            autoComplete="current-password"
            className="w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki"
            placeholder="••••••••"
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
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-2 text-center">
        <Link
          href="/auth/reset-password"
          className="text-xs font-sans text-leather hover:text-leather-dark transition-colors"
        >
          Forgot password?
        </Link>
        <p className="text-xs font-sans text-khaki">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-leather hover:text-leather-dark transition-colors font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
