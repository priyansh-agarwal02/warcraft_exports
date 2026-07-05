"use client"

import { useState, useRef, useEffect } from "react"
import { COUNTRY_PREFIXES } from "@/lib/phone"

interface PhoneInputProps {
  countryCode: string // e.g. "US", "CA", "IN"
  numberValue: string
  onCountryChange: (code: string, prefix: string) => void
  onNumberChange: (number: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
}

export function PhoneInput({
  countryCode,
  numberValue,
  onCountryChange,
  onNumberChange,
  placeholder = "Phone number",
  required = false,
  disabled = false,
  id,
  className = "",
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find country matching the selected countryCode (handles US vs CA uniquely!)
  const selectedCountry = COUNTRY_PREFIXES.find(c => c.code === countryCode) || COUNTRY_PREFIXES.find(c => c.code === "US") || COUNTRY_PREFIXES[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Filter countries by search query
  const filteredCountries = COUNTRY_PREFIXES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.prefix.includes(searchQuery) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchQuery("")
    }
  }

  const handleSelect = (code: string, prefix: string) => {
    onCountryChange(code, prefix)
    setIsOpen(false)
  }

  return (
    <div className={`flex gap-2 relative w-full ${className}`} ref={dropdownRef}>
      {/* Country Prefix Dropdown Selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          aria-expanded={isOpen}
          className="h-full min-w-[100px] px-3 py-2.5 text-sm font-sans bg-parchment/60 border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark flex items-center justify-between gap-1 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-parchment/80 transition-colors"
        >
          <span>{selectedCountry.code} ({selectedCountry.prefix})</span>
          <svg
            className={`w-3 h-3 text-khaki transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-64 max-h-64 overflow-hidden flex flex-col bg-canvas border border-khaki/30 rounded-sm shadow-xl z-50">
            {/* Search Input */}
            <div className="p-2 border-b border-khaki/20 bg-parchment/30">
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-2.5 py-1.5 text-xs font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki"
              />
            </div>

            {/* Countries List */}
            <div className="overflow-y-auto flex-1 py-1 max-h-[180px]">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={`${country.code}-${country.prefix}`}
                    type="button"
                    onClick={() => handleSelect(country.code, country.prefix)}
                    className="w-full px-3 py-2 text-left text-xs font-sans text-leather-dark hover:bg-parchment flex justify-between items-center transition-colors"
                  >
                    <span className="truncate">{country.name} ({country.code})</span>
                    <span className="font-semibold text-khaki flex-shrink-0 ml-2">{country.prefix}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs font-sans text-khaki text-center">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Digits Phone Input */}
      <input
        id={id}
        type="tel"
        required={required}
        disabled={disabled}
        value={numberValue}
        onChange={(e) => onNumberChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full px-3 py-2.5 text-sm font-sans bg-parchment border border-khaki rounded-sm focus:outline-none focus:border-leather text-leather-dark placeholder:text-khaki/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      />
    </div>
  )
}
