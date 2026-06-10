"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"

export type DateRange = "7d" | "30d" | "90d" | "custom"

interface DateRangePickerProps {
  value: DateRange
  customFrom?: string
  customTo?: string
  onChange: (range: DateRange, from?: string, to?: string) => void
  loading?: boolean
}

export function DateRangePicker({ value, customFrom, customTo, onChange, loading }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(value === "custom")
  const [from, setFrom] = useState(customFrom ?? "")
  const [to, setTo] = useState(customTo ?? "")

  const presets: { label: string; value: DateRange }[] = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => {
            setShowCustom(false)
            onChange(preset.value)
          }}
          disabled={loading}
          className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-all duration-200 disabled:opacity-50 ${
            value === preset.value && !showCustom
              ? "bg-[#33450D] text-white border-[#33450D]"
              : "border-[#E4E4E7] text-[#71717A] hover:border-[#33450D] hover:text-[#33450D]"
          }`}
        >
          {preset.label}
        </button>
      ))}

      <button
        onClick={() => setShowCustom(!showCustom)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-all duration-200 disabled:opacity-50 ${
          showCustom
            ? "bg-[#33450D] text-white border-[#33450D]"
            : "border-[#E4E4E7] text-[#71717A] hover:border-[#33450D] hover:text-[#33450D]"
        }`}
      >
        <Calendar size={12} />
        Custom
      </button>

      {showCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-[#E4E4E7] px-2 py-1 text-[11px] font-sans focus:border-[#33450D] focus:outline-none bg-white"
          />
          <span className="text-[11px] text-[#A1A1AA]">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-[#E4E4E7] px-2 py-1 text-[11px] font-sans focus:border-[#33450D] focus:outline-none bg-white"
          />
          <button
            onClick={() => {
              if (from && to) onChange("custom", from, to)
            }}
            disabled={!from || !to || loading}
            className="bg-[#33450D] text-white text-[10px] font-bold uppercase px-3 py-1.5 hover:bg-[#4A5D23] transition-colors disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {loading && (
        <div className="ml-2 flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-[#33450D] border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-[#A1A1AA] font-sans">Refreshing…</span>
        </div>
      )}
    </div>
  )
}
