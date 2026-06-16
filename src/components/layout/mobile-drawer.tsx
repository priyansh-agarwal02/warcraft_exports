"use client"
import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import { siteConfig } from "@/config/site.config"
import { cn } from "@/lib/utils"

export function MobileDrawer() {
  const [open, setOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 text-leather-dark"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-leather-dark/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-parchment z-50 flex flex-col transition-transform duration-300 lg:hidden shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-khaki/50">
          <span className="font-heading text-lg font-black text-[#18181B] tracking-[-0.04em] uppercase">
            WARCRAFT EXPORTS ®
          </span>
          <button onClick={() => setOpen(false)} className="p-1 text-leather-dark">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
          <Link href="/" onClick={() => setOpen(false)}
            className="block py-2.5 text-sm font-sans font-semibold uppercase tracking-widest text-leather-dark border-b border-khaki/30 hover:text-leather"
          >
            Home
          </Link>

          {/* Shop accordion */}
          <div className="border-b border-khaki/30">
            <button
              onClick={() => setShopOpen(!shopOpen)}
              className="w-full flex items-center justify-between py-2.5 text-sm font-sans font-semibold uppercase tracking-widest text-leather-dark hover:text-leather"
            >
              Shop
              <ChevronDown size={14} className={cn("transition-transform", shopOpen && "rotate-180")} />
            </button>
            {shopOpen && (
              <div className="pb-3 pl-3 space-y-1">
                <p className="text-[9px] text-khaki uppercase tracking-widest mb-1">By Nation</p>
                {siteConfig.navNations.map((n) => (
                  <Link key={n} href={`/shop/nation/${n.toLowerCase()}`} onClick={() => setOpen(false)}
                    className="block py-1.5 text-xs text-leather-dark hover:text-leather"
                  >{n}</Link>
                ))}
                <p className="text-[9px] text-khaki uppercase tracking-widest mt-2 mb-1">By Era</p>
                {siteConfig.eras.slice(0, 4).map((e) => (
                  <Link key={e} href={`/shop/era/${e.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setOpen(false)}
                    className="block py-1.5 text-xs text-leather-dark hover:text-leather"
                  >{e}</Link>
                ))}
                <Link href="/shop" onClick={() => setOpen(false)}
                  className="block mt-2 py-1.5 text-xs font-semibold text-leather"
                >View All Products →</Link>
              </div>
            )}
          </div>

          {[
            { href: "/about",     label: "About Us" },
            { href: "/wholesale", label: "Wholesale" },
            { href: "/contact",   label: "Contact" },
            { href: "/faq",       label: "FAQ" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-sans font-semibold uppercase tracking-widest text-leather-dark border-b border-khaki/30 hover:text-leather"
            >{label}</Link>
          ))}
          <Link href="/sale" onClick={() => setOpen(false)}
            className="block py-2.5 text-sm font-sans font-bold uppercase tracking-widest text-red-600 border-b border-khaki/30 hover:text-red-700"
          >
            Sale
          </Link>
        </nav>

        {/* Footer links */}
        <div className="px-5 py-4 border-t border-khaki/50 space-y-1">
          <Link href="/login" onClick={() => setOpen(false)} className="block text-xs text-leather hover:text-leather-dark">My Account</Link>
          <Link href="/track-order" onClick={() => setOpen(false)} className="block text-xs text-leather hover:text-leather-dark">Track Order</Link>
        </div>
      </div>
    </>
  )
}
