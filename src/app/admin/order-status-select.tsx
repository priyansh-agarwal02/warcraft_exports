"use client"

import { useTransition } from "react"
import { updateOrderStatus } from "./actions"

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const nextStatus = e.target.value
        startTransition(async () => {
          try {
            await updateOrderStatus(orderId, nextStatus)
          } catch (err) {
            console.error("Failed to update status:", err)
          }
        })
      }}
      className="text-[11px] font-sans border border-[#E4E4E7] px-1.5 py-1 focus:border-[#33450D] focus:outline-none bg-white disabled:opacity-50"
    >
      <option value="confirmed">Confirmed</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  )
}
