"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Tag, BarChart3, Settings, ChevronRight, ShoppingCart, Users, Percent, MessageSquare, Star, Inbox, FileText, Search, Activity, Upload, Warehouse, Truck, Mail, Menu, X, Home } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = { label: string; href: string; icon: React.ElementType }
type NavSection = { section: string; items: NavItem[] }
type NavEntry = NavItem | NavSection

const NAV: NavEntry[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    section: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tag },
      { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
      { label: "Bulk Upload", href: "/admin/products/upload", icon: Upload },
    ],
  },
  {
    section: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
    ],
  },
  {
    section: "Marketing",
    items: [
      { label: "Sale Manager", href: "/admin/sale", icon: Tag },
      { label: "Promotions", href: "/admin/promotions", icon: Percent },
      { label: "B2B Inquiries", href: "/admin/b2b", icon: Inbox },
      { label: "Contact Queries", href: "/admin/contact", icon: MessageSquare },
      { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
    ],
  },
  {
    section: "Content",
    items: [
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Content", href: "/admin/content", icon: FileText },
      { label: "SEO", href: "/admin/seo", icon: Search },
      { label: "Chat Logs", href: "/admin/chat", icon: MessageSquare },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Activity Log", href: "/admin/activity-log", icon: Activity },
    ],
  },
]

function isSection(entry: NavEntry): entry is NavSection {
  return "section" in entry
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    /*
     * Desktop: sidebar is `fixed` (immune to overflow-x:hidden on body which
     *   breaks sticky). The entire sidebar scrolls as one unit via overflow-y-auto.
     *   Main content gets lg:ml-64 to clear the fixed sidebar.
     * Mobile: sidebar is a slide-in drawer, hidden by default.
     */
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — the ENTIRE sidebar scrolls as one container ── */}
      <aside
        className={cn(
          // Fixed to viewport, full height, scrolls as one unit (like old version)
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#18181B] overflow-y-auto transition-transform duration-300",
          // Desktop: always visible | Mobile: toggle drawer
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="block" onClick={() => setSidebarOpen(false)}>
            <p className="text-[10px] font-sans text-white/40 uppercase tracking-[0.2em] mb-0.5">Warcraft Exports</p>
            <p className="font-heading text-white text-[18px] uppercase tracking-wide">Admin Panel</p>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation — all items flow naturally, sidebar itself scrolls */}
        <nav className="px-3 py-4 space-y-0.5">
          {NAV.map((entry) => {
            if (!isSection(entry)) {
              const active = entry.href === "/admin" ? pathname === "/admin" : pathname === entry.href
              const Icon = entry.icon
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-[13px] font-sans font-medium transition-colors rounded-sm",
                    active
                      ? "bg-[#33450D] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={16} />
                  {entry.label}
                </Link>
              )
            }
            return (
              <div key={entry.section} className="pt-3">
                <p className="px-3 pb-1 text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-white/25">
                  {entry.section}
                </p>
                <div className="space-y-0.5">
                  {entry.items.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 text-[13px] font-sans font-medium transition-colors rounded-sm",
                          active
                            ? "bg-[#33450D] text-white"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Footer link */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-sans text-white/50 hover:text-white transition-colors"
          >
            <Home size={16} />
            View Store
          </Link>
        </div>
      </aside>

      {/* ── Main content — offset by sidebar width on desktop ── */}
      <div className="flex flex-col min-h-screen lg:ml-64">
        {/* Top breadcrumb bar */}
        <div className="bg-white border-b border-[#E4E4E7] px-4 sm:px-8 py-3 flex items-center justify-between gap-2 text-[12px] font-sans text-[#71717A] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 mr-1 text-[#18181B] hover:bg-[#F4F4F4] transition-colors rounded-sm"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <Link href="/admin" className="hover:text-[#18181B] transition-colors">Admin</Link>
            {pathname !== "/admin" && (
              <>
                <ChevronRight size={12} />
                <span className="text-[#18181B] font-medium capitalize">
                  {pathname.split("/").filter(Boolean).slice(1).join(" / ")}
                </span>
              </>
            )}
          </div>
          <div className="lg:hidden">
            <Link href="/" className="text-[10px] font-sans font-bold uppercase tracking-wide border border-[#E4E4E7] px-2.5 py-1 hover:bg-[#FAFAF9] transition-all">
              Store
            </Link>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
