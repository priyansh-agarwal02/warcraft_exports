"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
    } else {
      router.push("/shop")
    }
  }

  return (
    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[360px] mx-6">
      <div className="relative w-full flex items-center border border-[#A1A1AA] bg-white h-[42px] px-3 gap-2.5 hover:border-[#18181B] focus-within:border-[#18181B] transition-colors">
        <button type="submit" aria-label="Search" className="flex-shrink-0">
          <Search size={15} className="text-[#71717A] hover:text-[#18181B] transition-colors" />
        </button>
        <input
          type="search"
          placeholder="Search archive..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-[12.5px] font-sans bg-transparent border-none outline-none placeholder:text-[#A1A1AA] text-[#18181B] uppercase tracking-[0.03em] w-full"
        />
      </div>
    </form>
  )
}
