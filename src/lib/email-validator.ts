/**
 * Smart Email Typo Validator & Correction Engine
 * 
 * Provides client-side and server-side domain hygiene by detecting common
 * domain typos (e.g. gmai.com, gamil.com, yaho.com, hotmial.com, etc.)
 * and proposing instantaneous 1-click corrections.
 */

export const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  // Google / Gmail
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gma.com": "gmail.com",
  "gmaiil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmaild.com": "gmail.com",
  "gmaio.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmeil.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmai.co": "gmail.com",
  "gamil.co": "gmail.com",

  // Yahoo
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaho.co": "yahoo.com",
  "ymail.con": "ymail.com",
  "yhaoo.co": "yahoo.com",

  // Hotmail
  "hotmial.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmali.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmeil.com": "hotmail.com",

  // Outlook
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "putlook.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",

  // Apple iCloud
  "icoud.com": "icloud.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
}

/**
 * Suggests an email correction if the domain has a known typo.
 * Returns the full corrected email address, or null if no typo detected.
 */
export function suggestEmailCorrection(email: string | null | undefined): string | null {
  if (!email || typeof email !== "string" || !email.includes("@")) return null
  const trimmed = email.trim().toLowerCase()
  const parts = trimmed.split("@")
  if (parts.length !== 2) return null
  const [local, domain] = parts
  if (!local || !domain) return null

  // 1. Check known domain typo map
  if (COMMON_DOMAIN_TYPOS[domain]) {
    return `${local}@${COMMON_DOMAIN_TYPOS[domain]}`
  }

  // 2. Check common TLD typos (.con, .cmo, .cpm, .comm instead of .com)
  if (domain.endsWith(".con") || domain.endsWith(".cmo") || domain.endsWith(".cpm") || domain.endsWith(".comm")) {
    const fixedDomain = domain.replace(/\.(con|cmo|cpm|comm)$/, ".com")
    return `${local}@${fixedDomain}`
  }

  return null
}

/**
 * Returns true if the email domain is a recognized blatant typo that will fail deliverability.
 */
export function isBlatantTypo(email: string | null | undefined): boolean {
  return suggestEmailCorrection(email) != null
}
