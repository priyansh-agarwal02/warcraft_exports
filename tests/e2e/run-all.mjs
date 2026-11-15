// Read-only end-to-end checks (UI on phone/tablet/desktop, shopper journey, security probes).
// Never places orders, submits forms or makes payments.
//
// Usage:
//   npm run build && npm run start          (in one terminal)
//   npm run test:e2e                        (in another; defaults to http://localhost:3000)
//   BASE=http://localhost:3005 npm run test:e2e
//
// Do NOT point this at the live site in bulk: Vercel's firewall blocks automated traffic.
// Results: test-results/e2e/*.json and screenshots in test-results/e2e/shots/
import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const BASE = (process.env.BASE || "http://localhost:3000").replace(/\/$/, "")
const out = join(here, "..", "..", "test-results", "e2e")
mkdirSync(out, { recursive: true })

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, BASE))
const list = join(out, "sitemap.txt")
writeFileSync(list, urls.join("\n"))
console.log(`Testing ${BASE} (${urls.length} sitemap URLs)`)

for (const script of ["ui.cjs", "flows.cjs", "sec.cjs"]) {
  console.log(`\n=== ${script} ===`)
  execFileSync(process.execPath, [join(here, script), list], { stdio: "inherit", env: { ...process.env, BASE } })
}
