"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, Mail, Sparkles, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    const supabase = createClient()
    let active = true
    let initTimeoutId: any = null

    async function initAuth() {
      try {
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          initTimeoutId = setTimeout(() => reject(new Error("Auth check timed out")), 1500)
        })

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        if (initTimeoutId) clearTimeout(initTimeoutId)

        if (active) {
          setUser(session?.user ?? null)
          setAuthInitialized(true)
        }
      } catch (err) {
        console.warn("[WELCOME POPUP] Auth check timed out or failed:", err)
        if (active) {
          setUser(null)
          setAuthInitialized(true)
        }
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setAuthInitialized(true)
      }
    })

    return () => {
      active = false
      if (initTimeoutId) clearTimeout(initTimeoutId)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authInitialized) return

    // Do not show popup if user is logged in
    if (user) {
      setIsOpen(false)
      return
    }

    // Check if user has already dismissed the popup
    const dismissed = localStorage.getItem("warcraft_welcome_dismissed")
    if (dismissed === "true") return

    // Add a 3-second delay on page load for a smooth transition
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [user, authInitialized])

  function handleClose() {
    setIsOpen(false)
    localStorage.setItem("warcraft_welcome_dismissed", "true")
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("success")
        // Dismiss the popup after showing success message for 2.5 seconds
        setTimeout(() => {
          setIsOpen(false)
          localStorage.setItem("warcraft_welcome_dismissed", "true")
        }, 2500)
      } else {
        setStatus("error")
      }
    } catch (err) {
      console.error("[WELCOME POPUP] Newsletter submission error:", err)
      setStatus("error")
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Subtle Dark Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 z-[90] bg-[#1E140C]/35 backdrop-blur-[1.5px]"
      />

      {/* Floating Centered Modal Card */}
      <div className="fixed top-1/2 left-1/2 z-[100] max-w-sm w-[calc(100vw-3rem)] bg-[#FDFBF7] border-2 border-leather shadow-2xl p-6 animate-zoom-in">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 text-khaki hover:text-leather transition-colors p-1"
          aria-label="Close welcome notification"
        >
          <X size={16} />
        </button>
        
        {/* Header */}
        <div className="mb-4">
          <span className="block text-[9px] font-sans font-bold tracking-[0.2em] text-leather uppercase mb-1 flex items-center gap-1">
            <Sparkles size={10} className="text-gold" />
            Greetings, Collector
          </span>
          <h3 className="font-heading text-[18px] text-leather-dark uppercase font-black leading-tight">
            Warcraft Exports
          </h3>
        </div>

        {/* Description */}
        <p className="text-[12px] font-sans text-leather-dark/85 leading-relaxed mb-4">
          Step into history with our museum-quality WW1 & WW2 reproductions. Sign in to track orders, or subscribe below for updates and promotions.
        </p>

        {/* Quick Auth Links */}
        <div className="grid grid-cols-2 gap-2 mb-4 border-b border-khaki/30 pb-4">
          <Link 
            href="/auth/login" 
            onClick={handleClose}
            className="text-center bg-leather text-white py-2 text-[10px] font-sans font-bold uppercase tracking-[0.12em] hover:bg-leather-dark transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/register" 
            onClick={handleClose}
            className="text-center border border-khaki text-leather-dark py-2 text-[10px] font-sans font-bold uppercase tracking-[0.12em] hover:border-leather hover:bg-[#FAFAF9] transition-colors"
          >
            Register
          </Link>
        </div>

        {/* Newsletter signup tag */}
        <form onSubmit={handleSubscribe} className="space-y-2.5">
          <label className="block text-[9px] font-sans font-bold uppercase tracking-[0.1em] text-khaki">
            Subscribe for Newsletter
          </label>
          {status === "success" ? (
            <div className="flex items-center gap-2 text-[11px] font-sans font-bold text-green-700 bg-green-50 border border-green-200 p-2.5">
              <CheckCircle2 size={14} className="shrink-0" />
              Subscription complete! Welcome.
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-khaki" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address..."
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-khaki/50 text-leather-dark placeholder:text-khaki/60 focus:outline-none focus:border-leather font-sans"
                    style={{ paddingLeft: "2.1rem" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-4 py-2 bg-gold text-leather-dark text-[11px] font-sans font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors disabled:opacity-50 shrink-0"
                >
                  {status === "loading" ? "..." : "Join"}
                </button>
              </div>
              {status === "error" && (
                <p className="text-[10px] text-red-600 font-sans">
                  Unable to subscribe. Please try again.
                </p>
              )}
            </>
          )}
        </form>

        {/* Framed value proposition callout */}
        <div className="mt-4 p-3 border border-dashed border-gold/60 bg-gold/5 text-center text-[10.5px] font-sans text-leather/90 leading-normal">
          Subscribe and register to get to know about our <strong>latest promotions, sales, and new launches</strong>.
        </div>

        {/* Custom CSS for smooth centering and scale entrance */}
        <style>{`
          @keyframes zoomIn {
            from { transform: translate(-50%, -46%) scale(0.96); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          .animate-zoom-in {
            animation: zoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    </>
  )
}
