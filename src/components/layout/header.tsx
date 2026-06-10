import Link from "next/link"
import { Search, Heart } from "lucide-react"
import { MegaMenu } from "./mega-menu"
import { MobileDrawer } from "./mobile-drawer"
import { CartIcon } from "./cart-icon"
import { UserIcon } from "./user-icon"
import { SearchBar } from "./search-bar"
export function Header() {
  return (
    <>

      {/* Main header */}
      <header className="bg-[#FAFAF9] border-b-2 border-[#18181B]">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex items-center h-[88px] gap-6">

            {/* Mobile drawer trigger */}
            <MobileDrawer />

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex flex-col mr-4">
              <span className="font-heading text-2xl text-[#18181B] tracking-[-0.04em] leading-none uppercase font-black">
                WARCRAFT<br /><span className="text-[#18181B] tracking-[-0.04em]">EXPORTS ®</span>
              </span>
              <span className="text-[9px] font-sans font-medium tracking-[0.15em] text-leather uppercase mt-1">
                Est. India · Since 2017
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <MegaMenu />
              {[
                { href: "/wholesale", label: "Wholesale" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[14.5px] font-sans font-bold uppercase tracking-[0.04em] text-[#18181B] hover:text-leather border-b-2 border-transparent hover:border-leather transition-all pb-0.5"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/sale"
                className="text-[14.5px] font-sans font-bold uppercase tracking-[0.04em] text-red-600 hover:text-red-700 border-b-2 border-transparent hover:border-red-600 transition-all pb-0.5"
              >
                Sale
              </Link>
            </nav>

            <SearchBar />

            {/* Right icons */}
            <div className="ml-auto flex items-center gap-0.5">
              <button className="md:hidden p-2.5 text-[#18181B] hover:text-leather" aria-label="Search">
                <Search size={20} />
              </button>
              <Link href="/account/wishlist" className="p-2.5 text-[#18181B] hover:text-leather transition-colors" aria-label="Wishlist">
                <Heart size={20} />
              </Link>
              <UserIcon />
              <CartIcon />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
