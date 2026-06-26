"use client"

import Link from "next/link"
import { Search, Heart } from "lucide-react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, LayoutGroup } from "framer-motion"
import { MegaMenu } from "./mega-menu"
import { MobileDrawer } from "./mobile-drawer"
import { CartIcon } from "./cart-icon"
import { UserIcon } from "./user-icon"
import { SearchBar } from "./search-bar"

const NAV_LINKS = [
  { href: "/wholesale", label: "Wholesale" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  return (
    <>
      {/* Main header — sticky top-0 z-40, announcement bar above at z-50 */}
      <header className="bg-[#FAFAF9] border-b-2 border-[#18181B]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="flex items-center h-[88px] gap-2 sm:gap-6">

            {/* Mobile drawer trigger */}
            <MobileDrawer />

            {/* MOTION: Logo has a subtle hover scale */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Link href="/" className="flex-shrink-0 flex flex-col mr-1 sm:mr-4">
                <span className="font-heading text-xl sm:text-2xl text-[#18181B] tracking-[-0.04em] leading-none uppercase font-black">
                  WARCRAFT<br /><span className="text-[#18181B] tracking-[-0.04em]">EXPORTS ®</span>
                </span>
                <span className="text-[9px] font-sans font-medium tracking-[0.15em] text-leather uppercase mt-1">
                  Est. India · Since 2017
                </span>
              </Link>
            </motion.div>

            {/* Desktop nav with shared sliding underline */}
            <nav className="hidden lg:flex items-center gap-6">
              <MegaMenu />

              {/* MOTION: layoutId shared underline slides between nav items */}
              <LayoutGroup id="nav-underline">
                {NAV_LINKS.map(({ href, label }) => {
                  const isActive = pathname === href
                  const isHighlighted = hovered === href || (!hovered && isActive)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onMouseEnter={() => setHovered(href)}
                      onMouseLeave={() => setHovered(null)}
                      className="relative text-[14.5px] font-sans font-bold uppercase tracking-[0.04em] text-[#18181B] hover:text-leather transition-colors pb-0.5"
                    >
                      {label}
                      {isHighlighted && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-leather"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  )
                })}

                {/* Sale link — separate red underline */}
                <Link
                  href="/sale"
                  onMouseEnter={() => setHovered("/sale")}
                  onMouseLeave={() => setHovered(null)}
                  className="relative text-[14.5px] font-sans font-bold uppercase tracking-[0.04em] text-red-600 hover:text-red-700 transition-colors pb-0.5"
                >
                  Sale
                  {(hovered === "/sale" || (!hovered && pathname === "/sale")) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </LayoutGroup>
            </nav>

            <SearchBar />

            {/* Right icons */}
            <div className="ml-auto flex items-center gap-0.5">
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-1.5 sm:p-2.5 text-[#18181B] hover:text-leather"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* MOTION: Wishlist heart icon — spring tap */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Link href="/account/wishlist" className="p-1.5 sm:p-2.5 text-[#18181B] hover:text-leather transition-colors block" aria-label="Wishlist">
                  <Heart size={20} />
                </Link>
              </motion.div>

              <UserIcon />
              <CartIcon />
            </div>

          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-white border-t border-[#18181B] px-4 py-3 shadow-md">
            <MobileSearchBar onClose={() => setIsMobileSearchOpen(false)} />
          </div>
        )}
      </header>
    </>
  )
}

function MobileSearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/shop")
    }
    onClose()
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full">
      <div className="relative w-full flex items-center border border-[#A1A1AA] bg-white h-[42px] px-3 gap-2.5 focus-within:border-[#18181B] transition-colors">
        <button type="submit" aria-label="Search" className="flex-shrink-0">
          <Search size={15} className="text-[#71717A] hover:text-[#18181B] transition-colors" />
        </button>
        <input
          type="search"
          placeholder="Search archive..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="flex-1 text-[12.5px] font-sans bg-transparent border-none outline-none placeholder:text-[#A1A1AA] text-[#18181B] uppercase tracking-[0.03em] w-full"
        />
      </div>
    </form>
  )
}
