"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 24

export function Pagination({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPage = parseInt(searchParams.get("page") ?? "1", 10)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Build page number list with ellipsis markers
  const pageNums: (number | "...")[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 2 && p <= currentPage + 2)
    ) {
      pageNums.push(p)
    } else if (
      pageNums[pageNums.length - 1] !== "..."
    ) {
      pageNums.push("...")
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 border border-khaki/50 rounded-sm text-leather disabled:opacity-30 hover:border-leather transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      {pageNums.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-xs text-khaki px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`min-w-[32px] h-8 text-xs border rounded-sm transition-colors ${
              p === currentPage
                ? "bg-leather text-parchment border-leather"
                : "border-khaki/50 text-leather hover:border-leather"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 border border-khaki/50 rounded-sm text-leather disabled:opacity-30 hover:border-leather transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
