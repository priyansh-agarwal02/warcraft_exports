"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart,
} from "recharts"

interface RevenueChartProps {
  data: { date: string; amount: number }[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#18181B] text-white px-3 py-2 text-[11px] font-sans shadow-lg border border-[#33450D]/30">
      <p className="font-bold">{label}</p>
      <p className="text-[#BBAC48]">${payload[0]?.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const avg = data.length > 0 ? total / data.length : 0
  const peak = Math.max(...data.map(d => d.amount), 0)
  const hasData = data.some(d => d.amount > 0)

  // Compute 5-day moving average for trend line
  const chartData = data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 4), i + 1)
    const ma = window.reduce((sum, w) => sum + w.amount, 0) / window.length
    return { ...d, displayDate: formatDate(d.date), trend: Math.round(ma * 100) / 100 }
  })

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Revenue</h2>
        <span className="text-[11px] font-sans bg-[#33450D] text-white px-2 py-0.5 uppercase tracking-wide font-bold">
          Total: ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>

      {!hasData ? (
        <div className="h-[220px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4]">
          <div className="text-center">
            <p className="text-[13px] text-[#A1A1AA] font-sans">No revenue data in this period</p>
            <p className="text-[11px] text-[#D4D4D8] font-sans mt-1">Revenue will appear here once orders are placed</p>
          </div>
        </div>
      ) : (
        <div className="h-[220px] bg-[#FAF9F6] border border-[#F4F4F4] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 9, fill: "#A1A1AA", fontFamily: "var(--font-work-sans)" }}
                tickLine={false}
                axisLine={{ stroke: "#E4E4E7" }}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#A1A1AA", fontFamily: "var(--font-work-sans)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="#33450D"
                radius={[2, 2, 0, 0]}
                maxBarSize={20}
                animationDuration={800}
                animationBegin={400}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#BBAC48"
                strokeWidth={2}
                dot={false}
                animationDuration={1200}
                animationBegin={600}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-3 border-t border-[#F4F4F4] pt-4 mt-4 text-center">
        <div>
          <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider">Period Total</p>
          <p className="text-[15px] font-heading font-black text-[#18181B] mt-0.5">
            ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider">Daily Avg</p>
          <p className="text-[15px] font-heading font-black text-[#18181B] mt-0.5">
            ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider">Peak Day</p>
          <p className="text-[15px] font-heading font-black text-green-600 mt-0.5">
            ${peak.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
