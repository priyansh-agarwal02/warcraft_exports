"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  ShieldAlert 
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserProfile } from "@/app/actions/auth"

export function UserIcon() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)

  const [isOpen, setIsOpen] = useState(false)

  // 1. Sync auth state and session checking with a timeout failsafe to prevent infinite loading hangs
  useEffect(() => {
    const supabase = createClient()
    let active = true
    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (active) {
          setUser(session?.user ?? null)
          setAuthInitialized(true)
        }
      } catch (err) {
        if (active) {
          setUser(null)
          setAuthInitialized(true)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      
      const authUser = session?.user ?? null
      setUser(authUser)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // 2. Fetch profile ONLY when auth check is complete and we actually have a user
  useEffect(() => {
    let active = true

    async function fetchProfile() {
      if (!user) {
        if (active) {
          setProfile(null)
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)

        // Use the Server Action to bypass RLS recursion blocking the admin fetch
        const userProfile = await getUserProfile()

        if (active) {
          if (userProfile) {
            setProfile(userProfile)
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      active = false
    }
  }, [user, authInitialized])



  // Get initials for avatar display
  const getInitials = () => {
    if (profile?.full_name) {
      const parts = profile.full_name.trim().split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return parts[0].slice(0, 2).toUpperCase()
    }
    const emailStr = profile?.email || user?.email || ""
    if (emailStr) {
      return emailStr.slice(0, 2).toUpperCase()
    }
    return "US"
  }

  const initials = getInitials()

  return (
    <div
      onMouseEnter={() => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
          setIsOpen(true)
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
          setIsOpen(false)
        }
      }}
      className="relative inline-block"
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger className="relative p-1.5 sm:p-2.5 text-[#18181B] hover:text-leather transition-colors cursor-pointer outline-none block focus:outline-none" aria-label={user ? "User menu" : "Sign in / Register"}>
          {/* MOTION: Icon scales slightly on hover, taps down on click */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="relative">
            <User size={20} />
            {user && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute top-0 right-0 w-2 h-2 bg-[#BBAC48] border border-[#FAFAF9] rounded-full"
              />
            )}
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          alignOffset={-32}
          className="w-48 mt-1.5 border-[#76786B] bg-white select-none overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
          onMouseEnter={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 1024) {
              setIsOpen(true)
            }
          }}
          onMouseLeave={() => {
            if (typeof window !== "undefined" && window.innerWidth >= 1024) {
              setIsOpen(false)
            }
          }}
        >
          {loading ? (
            <div className="px-4 py-6 text-center text-[10px] font-sans font-bold uppercase tracking-widest text-khaki">
              <span className="inline-block animate-pulse">Loading...</span>
            </div>
          ) : user ? (
            <>
              {/* Logged In Header */}
              <div className="px-3 py-3 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#33450D] border border-[#76786B] text-white flex items-center justify-center font-heading text-[13px] font-bold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-xs font-bold text-leather-dark truncate leading-tight">
                    {profile?.full_name || "Warcraft Collector"}
                  </p>
                  <p className="font-sans text-[10px] text-khaki truncate leading-normal mt-0.5">
                    {profile?.email || user.email}
                  </p>
                </div>
              </div>

              {/* Signed In Status Badge */}
              <div className="px-3 pb-2.5">
                <div className="flex items-center justify-between border border-khaki/30 bg-[#F0F0EF] px-2 py-1">
                  <span className="text-[9px] font-sans font-bold tracking-widest text-khaki uppercase">Status</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-sans font-black tracking-widest text-[#33450D] uppercase">
                    <span className="w-1.5 h-1.5 bg-[#BBAC48] rounded-full" />
                    Signed In
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* User Links */}
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <User />
                  <span>My Dashboard</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/account/orders">
                  <ShoppingBag />
                  <span>My Orders</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/account/wishlist">
                  <Heart />
                  <span>Wishlist</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/account/addresses">
                  <MapPin />
                  <span>Addresses</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/account/settings">
                  <Settings />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>

              {/* Admin Panel Option */}
              {profile?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="focus:bg-[#BBAC48] focus:text-[#1A1C1C] focus:[&_svg]:text-[#1A1C1C]">
                    <Link href="/admin" className="font-extrabold text-[#BBAC48]">
                      <LayoutDashboard />
                      <span>Admin Configuration</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              {/* Sign Out — use a real form POST (same as account pages) so
                  the dropdown's onMouseLeave cannot cancel the submission */}
              <DropdownMenuItem asChild className="p-0">
                <form action="/auth/signout" method="POST" className="w-full">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-700 hover:bg-red-700 hover:text-white transition-colors cursor-pointer [&_svg]:text-current"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </form>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {/* Signed Out Menu */}
              <div className="px-3.5 py-3 text-center">
                <span className="block text-[10px] font-sans font-bold tracking-[0.15em] text-[#33450D] uppercase mb-1">
                  Warcraft Exports
                </span>
                <p className="text-[11px] font-sans text-khaki leading-normal mb-2.5">
                  Sign in to check orders, save addresses, and customize your wishlist history.
                </p>
                <DropdownMenuItem asChild className="px-0 py-0 w-full justify-center">
                  <Link
                    href="/auth/login"
                    className="flex justify-center items-center w-full bg-[#33450D] text-white py-2 text-[11px] font-sans font-bold uppercase tracking-[0.12em] hover:bg-[#4A5D23] hover:scale-[1.02] focus:bg-[#33450D] focus:text-white transition-all duration-150 active:scale-95 active:brightness-90"
                  >
                    Sign In / Register
                  </Link>
                </DropdownMenuItem>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
