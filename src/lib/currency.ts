import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CurrencyCode = "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "JPY" | "INR" | "SGD" | "SEK" | "NOK" | "DKK" | "CHF" | "PLN" | "CZK" | "NZD"

export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
]

type RatesMap = Partial<Record<CurrencyCode, number>>

type CurrencyStore = {
  currency: CurrencyCode
  rates: RatesMap
  lastFetched: number | null
  setCurrency: (code: CurrencyCode) => void
  fetchRates: () => Promise<void>
  convert: (usdAmount: number) => number
  format: (usdAmount: number) => string
}

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "USD",
      rates: {},
      lastFetched: null,

      setCurrency: (code) => set({ currency: code }),

      fetchRates: async () => {
        const now = Date.now()
        const { lastFetched } = get()
        // Cache rates for 1 hour
        if (lastFetched && now - lastFetched < 3600_000) return
        try {
          const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
          const data = await res.json()
          const rates: RatesMap = {}
          CURRENCIES.forEach(c => {
            if (data.rates[c.code]) rates[c.code] = data.rates[c.code]
          })
          rates.USD = 1
          set({ rates, lastFetched: now })
        } catch {
          // Silently fail — use USD if rates unavailable
        }
      },

      convert: (usdAmount) => {
        const { currency, rates } = get()
        if (currency === "USD") return usdAmount
        const rate = rates[currency] ?? 1
        return usdAmount * rate
      },

      format: (usdAmount) => {
        const { currency, convert } = get()
        const amount = convert(usdAmount)
        const curr = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]
        if (currency === "JPY") return `${curr.symbol}${Math.round(amount).toLocaleString()}`
        return `${curr.symbol}${amount.toFixed(2)}`
      },
    }),
    { name: "we-currency" }
  )
)
