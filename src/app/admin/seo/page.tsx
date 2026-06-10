import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { Globe, Search, FileText, Check, AlertCircle } from "lucide-react"

export const metadata: Metadata = { title: "SEO — Warcraft Exports Admin" }

// Global SEO settings stored in site_settings table (key: seo_*)
async function saveSeoSettings(formData: FormData) {
  "use server"
  const supabase = createServiceClient()
  const settings = {
    seo_site_title: formData.get("seo_site_title") as string,
    seo_site_description: formData.get("seo_site_description") as string,
    seo_og_image: formData.get("seo_og_image") as string,
    seo_google_verification: formData.get("seo_google_verification") as string,
    seo_bing_verification: formData.get("seo_bing_verification") as string,
  }
  for (const [key, value] of Object.entries(settings)) {
    await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" })
  }
  revalidatePath("/admin/seo")
}

async function savePageMeta(formData: FormData) {
  "use server"
  const supabase = createServiceClient()
  const page = formData.get("page") as string
  const meta_title = formData.get("meta_title") as string
  const meta_description = formData.get("meta_description") as string
  if (!page) return
  await supabase.from("page_seo").upsert({ page, meta_title, meta_description }, { onConflict: "page" })
  revalidatePath("/admin/seo")
}

const TRACKED_PAGES = [
  { page: "/", label: "Homepage" },
  { page: "/shop", label: "Shop All" },
  { page: "/wholesale", label: "Wholesale" },
  { page: "/about", label: "About" },
  { page: "/contact", label: "Contact" },
  { page: "/faq", label: "FAQ" },
  { page: "/fit-guide", label: "Fit Guide" },
  { page: "/stores", label: "Our Stores" },
]

const LABEL = "block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1"
const INPUT = "w-full border border-[#E4E4E7] px-3 py-2 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white"

export default async function AdminSeoPage() {
  const supabase = await createClient()

  // Load global settings
  const { data: settingsRows } = await supabase.from("site_settings").select("key, value").like("key", "seo_%")
  const settings: Record<string, string> = {}
  for (const row of (settingsRows ?? [])) settings[row.key] = row.value

  // Load per-page SEO overrides
  const { data: pageSeo } = await supabase.from("page_seo").select("page, meta_title, meta_description")
  const pageSeoMap: Record<string, { meta_title: string; meta_description: string }> = {}
  for (const row of (pageSeo ?? [])) pageSeoMap[row.page] = row

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://warcraftexports.com"

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">SEO Manager</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">
          Control meta tags, open graph settings, and per-page SEO overrides.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E4E4E7] p-4 flex items-center gap-3">
          <Globe size={20} className="text-[#33450D] flex-shrink-0" />
          <div>
            <p className="text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A]">Sitemap</p>
            <a href={`${baseUrl}/sitemap.xml`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-sans text-[#33450D] hover:underline">
              View sitemap.xml →
            </a>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4E7] p-4 flex items-center gap-3">
          <FileText size={20} className="text-[#33450D] flex-shrink-0" />
          <div>
            <p className="text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A]">Robots.txt</p>
            <a href={`${baseUrl}/robots.txt`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-sans text-[#33450D] hover:underline">
              View robots.txt →
            </a>
          </div>
        </div>
        <div className="bg-white border border-[#E4E4E7] p-4 flex items-center gap-3">
          <Search size={20} className="text-[#33450D] flex-shrink-0" />
          <div>
            <p className="text-[11px] font-sans font-bold uppercase tracking-wide text-[#71717A]">Search Console</p>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[12px] font-sans text-[#33450D] hover:underline">
              Open GSC →
            </a>
          </div>
        </div>
      </div>

      {/* Best practices checklist */}
      <div className="bg-[#33450D]/5 border border-[#33450D]/20 p-5 mb-8">
        <h2 className="font-heading text-[14px] text-[#33450D] uppercase mb-3">SEO Checklist</h2>
        <ul className="space-y-2 text-[12px] font-sans text-[#33450D]">
          {[
            { label: "robots.txt is live", done: true },
            { label: "sitemap.xml is live (auto-generated)", done: true },
            { label: "OG image set (og-image.jpg in /public)", done: false },
            { label: "Google Search Console verified", done: !!settings.seo_google_verification },
            { label: "Product pages have structured data (JSON-LD)", done: true },
            { label: "Organization schema in root layout", done: true },
          ].map(({ label, done }) => (
            <li key={label} className="flex items-center gap-2">
              {done
                ? <Check size={14} className="text-[#33450D] flex-shrink-0" />
                : <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
              }
              <span className={done ? "" : "text-amber-700"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Global SEO settings */}
      <div className="bg-white border border-[#E4E4E7] p-6 mb-8">
        <h2 className="font-heading text-[16px] text-[#18181B] uppercase mb-5">Global Settings</h2>
        <form action={saveSeoSettings} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={LABEL}>Default Site Title</label>
              <input name="seo_site_title" defaultValue={settings.seo_site_title ?? "Warcraft Exports — WW1 & WW2 Historical Reproduction Military Gear"} className={INPUT} maxLength={70} />
              <p className="text-[11px] text-[#A1A1AA] mt-1">Keep under 60 characters for best display in Google</p>
            </div>
            <div>
              <label className={LABEL}>Default Meta Description</label>
              <textarea name="seo_site_description" defaultValue={settings.seo_site_description ?? "Manufacturer and global exporter of WW1 & WW2 historical reproduction military gear. Ships worldwide from Kanpur, India."} rows={3} className={`${INPUT} resize-none`} maxLength={160} />
              <p className="text-[11px] text-[#A1A1AA] mt-1">Keep under 155 characters</p>
            </div>
            <div>
              <label className={LABEL}>OG Image URL (for social sharing)</label>
              <input name="seo_og_image" defaultValue={settings.seo_og_image ?? "/og-image.jpg"} className={INPUT} placeholder="/og-image.jpg or full URL" />
              <p className="text-[11px] text-[#A1A1AA] mt-1">Recommended size: 1200×630px. Place file in /public/</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Google Search Console Verification</label>
              <input name="seo_google_verification" defaultValue={settings.seo_google_verification ?? ""} placeholder="google-site-verification code" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Bing Webmaster Verification</label>
              <input name="seo_bing_verification" defaultValue={settings.seo_bing_verification ?? ""} placeholder="msvalidate.01 code" className={INPUT} />
            </div>
          </div>
          <button type="submit" className="bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-6 py-2.5 hover:bg-[#4A5D23] transition-colors">
            Save Global Settings
          </button>
        </form>
      </div>

      {/* Per-page SEO overrides */}
      <div className="bg-white border border-[#E4E4E7] p-6">
        <h2 className="font-heading text-[16px] text-[#18181B] uppercase mb-2">Per-Page SEO Overrides</h2>
        <p className="text-[12px] font-sans text-[#71717A] mb-5">Override the default meta title and description for specific pages.</p>
        <div className="space-y-6">
          {TRACKED_PAGES.map(({ page, label }) => {
            const existing = pageSeoMap[page]
            return (
              <form key={page} action={savePageMeta} className="border border-[#E4E4E7] p-4">
                <input type="hidden" name="page" value={page} />
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-sans font-bold text-[13px] text-[#18181B]">{label}</p>
                    <p className="text-[11px] font-mono text-[#A1A1AA]">{page}</p>
                  </div>
                  {existing && <span className="text-[10px] font-bold font-sans bg-[#33450D] text-white px-2 py-0.5 uppercase">Override Active</span>}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className={LABEL}>Meta Title</label>
                    <input name="meta_title" defaultValue={existing?.meta_title ?? ""} placeholder="Leave blank to use default" className={INPUT} maxLength={70} />
                  </div>
                  <div>
                    <label className={LABEL}>Meta Description</label>
                    <textarea name="meta_description" defaultValue={existing?.meta_description ?? ""} placeholder="Leave blank to use default" rows={2} className={`${INPUT} resize-none`} maxLength={160} />
                  </div>
                </div>
                <button type="submit" className="mt-3 bg-[#18181B] text-white text-[11px] font-sans font-bold uppercase tracking-[0.1em] px-4 py-2 hover:bg-[#33450D] transition-colors">
                  Save Override
                </button>
              </form>
            )
          })}
        </div>
      </div>
    </div>
  )
}
