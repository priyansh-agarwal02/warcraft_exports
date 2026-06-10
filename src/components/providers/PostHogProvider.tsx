"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { initPostHog, getPostHogClient } from "@/lib/posthog"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastCaptured = useRef("")

  // Initialize PostHog once
  useEffect(() => {
    initPostHog()
  }, [])

  // Capture pageview on route change
  useEffect(() => {
    const ph = getPostHogClient()
    if (!ph) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    if (url === lastCaptured.current) return
    lastCaptured.current = url

    ph.capture("$pageview", {
      $current_url: window.location.origin + url,
    })
  }, [pathname, searchParams])

  return <>{children}</>
}
