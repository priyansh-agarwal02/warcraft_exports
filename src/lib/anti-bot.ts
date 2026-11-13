/**
 * Invisible Anti-Bot & Newsletter Defense Engine
 * 
 * Multi-layer zero-friction defense against automated spam bots, scraper scripts,
 * and subscription-bombing attacks without using reCAPTCHA.
 */

// Known SMS-to-email gateway domains targeted by phone enumeration spam bots
export const SMS_GATEWAYS = new Set([
  "mail.uscc.net",
  "vtext.com",
  "txt.att.net",
  "tmomail.net",
  "mms.att.net",
  "messaging.sprintpcs.com",
  "msg.fi.google.com",
  "vmobl.com",
  "page.nextel.com",
])

// Known disposable / burner email domains
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "mytemp.email",
  "generator.email",
  "temp-mail.org",
  "fakemailgenerator.com",
  "emailondeck.com",
  "getnada.com",
  "inboxkitten.com",
])

// System and abuse trap addresses that should never be subscribed to a store newsletter
export const ABUSE_ROLE_PREFIXES = new Set([
  "abuse",
  "postmaster",
  "security",
  "hostmaster",
  "noc",
])

/**
 * Creates an obfuscated time-lock token for client forms
 */
export function createTimeToken(timestamp: number = Date.now()): string {
  // Simple reversible base64url encoding with a static signature salt
  const payload = `${timestamp}:we_human_chk`
  if (typeof Buffer !== "undefined") {
    return Buffer.from(payload).toString("base64url")
  }
  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * Parses and verifies an obfuscated time-lock token
 */
export function parseTimeToken(token: string | null | undefined): { valid: boolean; timestamp: number } {
  if (!token || typeof token !== "string") return { valid: false, timestamp: 0 }
  try {
    let decoded = ""
    if (typeof Buffer !== "undefined") {
      decoded = Buffer.from(token, "base64url").toString("utf8")
    } else {
      decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"))
    }
    const [tsStr, signature] = decoded.split(":")
    const ts = parseInt(tsStr, 10)
    if (isNaN(ts) || signature !== "we_human_chk") {
      return { valid: false, timestamp: 0 }
    }
    return { valid: true, timestamp: ts }
  } catch {
    return { valid: false, timestamp: 0 }
  }
}

/**
 * Checks if any honeypot input was filled by a bot
 */
export function isHoneypotTriggered(body: Record<string, any>): boolean {
  if (!body || typeof body !== "object") return false
  const honeypotKeys = [
    "b_website",
    "user_website_url",
    "organization_role",
    "phone_number_confirm",
  ]
  for (const key of honeypotKeys) {
    if (typeof body[key] === "string" && body[key].trim().length > 0) {
      return true
    }
  }
  return false
}

/**
 * Checks whether the submission meets human timing thresholds:
 * - Must take at least minMs (default 2000ms = 2.0s)
 * - Must not exceed maxMs (default 30m = 1,800,000ms)
 */
export function isTimeLockViolated(
  body: Record<string, any>,
  minMs: number = 2000,
  maxMs: number = 1800000
): { violated: boolean; reason?: string; elapsed?: number } {
  const token = body?._t ?? body?._token
  if (!token) {
    // Missing token entirely indicates an automated script calling the API directly
    return { violated: true, reason: "missing_token" }
  }

  const { valid, timestamp } = parseTimeToken(token)
  if (!valid || !timestamp) {
    return { violated: true, reason: "invalid_token" }
  }

  const now = Date.now()
  const elapsed = now - timestamp

  if (elapsed < minMs) {
    return { violated: true, reason: "too_fast", elapsed }
  }
  if (elapsed > maxMs) {
    return { violated: true, reason: "token_expired", elapsed }
  }

  return { violated: false, elapsed }
}

/**
 * Checks request Origin and Referer headers against allowed domains
 */
export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")
  const host = req.headers.get("host")

  // If both origin and referer are completely absent on a POST request, it is typically a raw curl / bot script
  if (!origin && !referer) {
    // In local development or server-side actions, allow if host is localhost
    if (host && (host.includes("localhost") || host.includes("127.0.0.1"))) return true
    return false
  }

  const checkUrl = origin || referer || ""
  try {
    const parsed = new URL(checkUrl)
    const hostname = parsed.hostname.toLowerCase()

    if (
      hostname === "warcraftexports.com" ||
      hostname.endsWith(".warcraftexports.com") ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".vercel.app")
    ) {
      return true
    }
  } catch {
    return false
  }

  return false
}

/**
 * Detects spam domains, SMS gateways, and algorithmic gibberish patterns
 */
export function isSpamEmailPattern(email: string): { isSpam: boolean; reason?: string } {
  if (!email || !email.includes("@")) {
    return { isSpam: true, reason: "malformed" }
  }

  const lower = email.trim().toLowerCase()
  const parts = lower.split("@")
  if (parts.length !== 2) return { isSpam: true, reason: "malformed" }

  const [local, domain] = parts

  // 1. Check SMS-to-email gateway domains
  if (SMS_GATEWAYS.has(domain)) {
    return { isSpam: true, reason: "sms_gateway" }
  }

  // 2. Check disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { isSpam: true, reason: "disposable_domain" }
  }

  // 3. Check system and abuse trap role prefixes
  if (ABUSE_ROLE_PREFIXES.has(local)) {
    return { isSpam: true, reason: "abuse_trap" }
  }

  // 4. Check for algorithmic gibberish Gmail patterns:
  // e.g. 7-18 lowercase characters followed by 2-5 digits like ozodomequfe000@gmail.com, qarerago103@gmail.com
  // These bots use syllable-generator words with consecutive alternating consonants/vowels + numbers.
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // 4a. Pure repetitive character spam, e.g. fcfcfdhb@gmail.com
    if (/^[b-df-hj-np-tv-z]{5,}@/i.test(lower)) {
      return { isSpam: true, reason: "consonant_cluster_gibberish" }
    }
    // 4b. Syllable-generator bots: length >= 12, ends with 2-4 digits, contains only letters followed by digits
    if (/^[a-z]{8,15}\d{2,4}$/.test(local)) {
      // Check vowel/consonant alternating pattern typical of automated password/email generators
      // (e.g. oz-od-om-eq-uf-e, ob-az-eb-eg-uv-o)
      const letterPart = local.replace(/\d+$/, "")
      const vowels = (letterPart.match(/[aeiou]/g) || []).length
      const consonants = letterPart.length - vowels
      const ratio = vowels / (letterPart.length || 1)
      // Natural names rarely have 10-15 character letter-only parts with an exact ~40-60% alternating ratio followed by 3 digits
      if (letterPart.length >= 10 && ratio >= 0.4 && ratio <= 0.6) {
        return { isSpam: true, reason: "algorithmic_gibberish" }
      }
    }
  }

  // 5. Scraped B2B trade / commercial keywords in consumer mailboxes
  const TRADE_SPAM_PATTERNS = /(?:lawyer|bodyshop|dentalclinic|taxllc|armorservice|towing|plumbing|roofing)/i
  if (TRADE_SPAM_PATTERNS.test(local)) {
    return { isSpam: true, reason: "scraped_trade_keyword" }
  }

  // 6. German GMX/Web.de automated dictionary trap patterns
  if ((domain === "gmx.de" || domain === "web.de" || domain === "gmx.net") && (local.includes(".") || local.includes("-")) && /\d{4,}$/.test(local)) {
    return { isSpam: true, reason: "german_gmx_trap_pattern" }
  }

  return { isSpam: false }
}

/**
 * Complete evaluation of a newsletter submission request.
 * Returns true if the submission is classified as a bot / spam.
 */
export function evaluateNewsletterBot(req: Request, body: Record<string, any>, email: string): { isBot: boolean; reason?: string } {
  // Check 1: Deceptive honeypot inputs
  if (isHoneypotTriggered(body)) {
    return { isBot: true, reason: "honeypot_triggered" }
  }

  // Check 2: Same-origin validation
  if (!isOriginAllowed(req)) {
    return { isBot: true, reason: "origin_disallowed" }
  }

  // Check 3: Cryptographic time-lock token
  const timeCheck = isTimeLockViolated(body)
  if (timeCheck.violated) {
    return { isBot: true, reason: timeCheck.reason }
  }

  // Check 4: Domain & algorithmic pattern check
  const patternCheck = isSpamEmailPattern(email)
  if (patternCheck.isSpam) {
    return { isBot: true, reason: patternCheck.reason }
  }

  return { isBot: false }
}

