"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { AlertTriangle, ShoppingBag, Truck, CheckCircle2 } from "lucide-react"

interface OrderStatusDonutProps {
  data: { status: string; count: number }[]
  orders?: any[]
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: "#22C55E",
  cancelled: "#EF4444",
  refunded: "#71717A",
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-[#18181B] text-white px-3 py-2 text-[11px] font-sans shadow-lg border border-[#33450D]/30">
      <p className="font-bold">{STATUS_LABELS[d.name] ?? d.name}</p>
      <p className="text-[#BBAC48]">{d.value} orders</p>
    </div>
  )
}

export function OrderStatusDonut({ data, orders = [] }: OrderStatusDonutProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, delay: 0.2, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  const total = data.reduce((sum, d) => sum + d.count, 0)
  const hasData = data.length > 0 && total > 0

  // 1. Pending Cancellation Request Alerts (Highest Priority — Always on top)
  const cancellationAlerts = orders
    .filter((o) => o.cancellation_requested && o.cancellation_request_status === "pending")
    .map((o) => {
      const orderNum = o.order_number ?? o.id.slice(0, 8).toUpperCase()
      return {
        id: o.id,
        text: `Cancellation requested #${orderNum}`,
        badge: "Action Needed",
        badgeColor: "text-red-700 font-bold",
        icon: AlertTriangle,
        iconColor: "text-red-600",
        createdAt: o.created_at,
      }
    })

  // 2. Recent Shipped & New Order Activity Alerts (Sorted by recency)
  const activityAlerts = orders
    .filter((o) => !(o.cancellation_requested && o.cancellation_request_status === "pending"))
    .map((o) => {
      const orderNum = o.order_number ?? o.id.slice(0, 8).toUpperCase()
      if (o.status === "shipped") {
        return {
          id: o.id,
          text: `Order #${orderNum} shipped`,
          badge: "Shipped",
          badgeColor: "text-purple-700 font-semibold",
          icon: Truck,
          iconColor: "text-purple-600",
          createdAt: o.created_at,
        }
      }
      if (o.status === "delivered") {
        return {
          id: o.id,
          text: `Order #${orderNum} delivered`,
          badge: "Delivered",
          badgeColor: "text-green-700 font-semibold",
          icon: CheckCircle2,
          iconColor: "text-green-600",
          createdAt: o.created_at,
        }
      }
      return {
        id: o.id,
        text: `New order #${orderNum} ($${Number(o.total_usd ?? 0).toFixed(2)})`,
        badge: "New",
        badgeColor: "text-blue-700 font-medium",
        icon: ShoppingBag,
        iconColor: "text-blue-600",
        createdAt: o.created_at,
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Combine: Cancellation Requests first, then latest Shipped & New order activity
  const displayAlerts = [...cancellationAlerts, ...activityAlerts].slice(0, 4)

  return (
    <div ref={containerRef} className="opacity-0 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[15px] uppercase tracking-wider text-[#18181B]">Order Status</h2>
        <Link href="/admin/orders" className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#33450D] hover:underline">
          Manage
        </Link>
      </div>

      {!hasData ? (
        <div className="h-[140px] flex items-center justify-center bg-[#FAF9F6] border border-[#F4F4F4]">
          <p className="text-[13px] text-[#A1A1AA] font-sans">No orders yet</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-[110px] h-[110px] relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  animationDuration={600}
                  animationBegin={200}
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#71717A"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-heading text-[16px] font-black text-[#18181B]">{total}</p>
                <p className="text-[7px] uppercase font-bold text-[#A1A1AA] tracking-wider">Total</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            {data.map((d) => (
              <div key={d.status} className="flex items-center justify-between text-[11px] font-sans">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[d.status] ?? "#71717A" }}
                  />
                  <span className="text-[#71717A] capitalize">{STATUS_LABELS[d.status] ?? d.status}</span>
                </div>
                <span className="font-bold text-[#18181B]">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Ultra-Compact Single-Line Alerts Feed (Maintains exact original tile height) ──── */}
      <div className="pt-2.5 border-t border-[#E4E4E7]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-heading text-[10px] uppercase tracking-wider text-[#71717A] font-bold">
            Alerts (30d)
          </span>
        </div>

        {displayAlerts.length === 0 ? (
          <div className="text-[#A1A1AA] text-[11px] font-sans py-1">
            No order alerts
          </div>
        ) : (
          <div className="divide-y divide-[#F4F4F4]">
            {displayAlerts.map((alert) => {
              const IconComp = alert.icon
              return (
                <Link
                  key={alert.id}
                  href={`/admin/orders/${alert.id}`}
                  className="py-1.5 flex items-center justify-between gap-2 text-[11px] font-sans hover:bg-[#FAF9F6] px-1 rounded-xs transition-colors group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconComp size={12} className={`${alert.iconColor} shrink-0`} />
                    <span className="text-[#18181B] truncate group-hover:underline">
                      {alert.text}
                    </span>
                  </div>
                  <span className={`text-[10px] shrink-0 font-sans ${alert.badgeColor}`}>
                    {alert.badge}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
