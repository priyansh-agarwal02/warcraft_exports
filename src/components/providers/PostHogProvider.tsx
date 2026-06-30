"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { initPostHog, getPostHogClient } from "@/lib/posthog"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastCaptured = useRef("")
  const [phInitialized, setPhInitialized] = useState(false)

  // Initialize PostHog when browser is idle or load event fires (avoids blocking initial render)
  useEffect(() => {
    const handleInit = () => {
      if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(() => {
            initPostHog()
            setPhInitialized(true)
          }, { timeout: 2000 })
        } else {
          setTimeout(() => {
            initPostHog()
            setPhInitialized(true)
          }, 1500)
        }
      }
    }

    if (document.readyState === "complete") {
      handleInit()
    } else {
      window.addEventListener("load", handleInit)
      return () => window.removeEventListener("load", handleInit)
    }
  }, [])

  // Capture pageview on route change or when initialized
  useEffect(() => {
    if (!phInitialized) return
    const ph = getPostHogClient()
    if (!ph) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    if (url === lastCaptured.current) return
    lastCaptured.current = url

    ph.capture("$pageview", {
      $current_url: window.location.origin + url,
    })
  }, [pathname, searchParams, phInitialized])

  return <>{children}</>
}
