import Link from "next/link"
import { siteConfig } from "@/config/site.config"
import { ChevronDown } from "lucide-react"

const CATEGORIES = [
  { name: "Holsters", slug: "holsters" },
  { name: "Ammunition Pouches", slug: "ammunition-pouches" },
  { name: "Belts & Straps", slug: "belts-straps" },
  { name: "Canvas Gear", slug: "canvas-gear" },
  { name: "Leather Gear", slug: "leather-gear" },
  { name: "Slings", slug: "slings" },
  { name: "Reenactment Sets", slug: "reenactment-sets" },
  { name: "Uniforms", slug: "uniforms" },
]

export function MegaMenu() {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 text-[14.5px] font-sans font-bold uppercase tracking-[0.04em] text-[#18181B] hover:text-leather border-b-2 border-transparent hover:border-leather transition-all pb-0.5">
        Shop
        <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
      </button>

      {/* Dropdown panel */}
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 mt-0 pt-2 z-50 w-[680px]">
        <div className="bg-parchment border border-khaki shadow-xl rounded-sm p-6 grid grid-cols-3 gap-6">

          {/* By Nation */}
          <div>
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-khaki mb-3 border-b border-khaki/40 pb-2">
              By Nation
            </p>
            <ul className="space-y-1.5">
              {siteConfig.navNations.map((n) => (
                <li key={n}>
                  <Link
                    href={`/shop/nation/${n.toLowerCase()}`}
                    className="text-xs font-sans text-leather-dark hover:text-leather hover:pl-1 transition-all duration-150 block"
                  >
                    {n}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-xs font-sans text-khaki hover:text-leather transition-colors">
                  All Nations →
                </Link>
              </li>
            </ul>
          </div>

          {/* By Era */}
          <div>
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-khaki mb-3 border-b border-khaki/40 pb-2">
              By Era
            </p>
            <ul className="space-y-1.5">
              {siteConfig.eras.slice(0, 4).map((e) => (
                <li key={e}>
                  <Link
                    href={`/shop/era/${e.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs font-sans text-leather-dark hover:text-leather hover:pl-1 transition-all duration-150 block"
                  >
                    {e}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Category */}
          <div>
            <p className="text-[10px] font-sans font-700 uppercase tracking-[0.15em] text-khaki mb-3 border-b border-khaki/40 pb-2">
              By Category
            </p>
            <ul className="space-y-1.5">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop/category/${c.slug}`}
                    className="text-xs font-sans text-leather-dark hover:text-leather hover:pl-1 transition-all duration-150 block"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-xs font-sans text-khaki hover:text-leather transition-colors">
                  All Categories →
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
