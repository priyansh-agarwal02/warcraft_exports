"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

interface CurrencyRevenueChartProps {
  data: { currency: string; amount: number; symbol: string }[]
}

const COLORS = ["#33450D", "#4A5D23", "#BBAC48", "#76786B", "#8B5CF6", "#3B82F6", "#F59E0B", "#22C55E", "#EF4444", "#EC4899", "#06B6D4"]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-[#18181B] text-white px-3 py-2 text-[11px] font-sans shadow-lg border border-[#33450D]/30">
      <p className="font-bold">{d.currency}</p>
      <p className="text-[#BBAC48]">${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
    </div>
  )
}

export function CurrencyRevenueChart({ data }: CurrencyRevenueChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.8, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const hasData = data.length > 0 && data.some(d => d.amount > 0)

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Revenue by Currency</h2>
      </div>

      {!hasData ? (
        <div className="h-[160px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4]">
          <div className="text-center">
            <p className="text-[13px] text-[#A1A1AA] font-sans">No currency data</p>
            <p className="text-[11px] text-[#D4D4D8] font-sans mt-1">Revenue split will appear with orders</p>
          </div>
        </div>
      ) : (
        <div className="h-[160px] bg-[#FAF9F6] border border-[#F4F4F4] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "#A1A1AA" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="currency"
                tick={{ fontSize: 10, fill: "#71717A", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                radius={[0, 3, 3, 0]}
                maxBarSize={18}
                animationDuration={800}
                animationBegin={800}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
