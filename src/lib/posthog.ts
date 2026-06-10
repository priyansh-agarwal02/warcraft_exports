import posthog from "posthog-js"

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ""
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"

let initialized = false

export function initPostHog() {
  if (typeof window === "undefined") return
  if (initialized) return
  if (!POSTHOG_KEY) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // Track manually on SPA route transition in PostHogProvider
    capture_pageleave: true,
    // @ts-ignore
    defaults: '2026-01-30',
  })

  initialized = true
}

export function getPostHogClient() {
  if (typeof window === "undefined") return null
  if (!initialized) initPostHog()
  return posthog
}

export default posthog
