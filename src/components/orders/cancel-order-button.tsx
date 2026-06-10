"use client"

import { useTransition } from "react"
import { cancelOrderAction } from "@/app/(store)/account/orders/[id]/actions"

type CancelOrderButtonProps = {
  orderId: string
  userId: string
}

export function CancelOrderButton({ orderId, userId }: CancelOrderButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("order_id", orderId)
      formData.append("user_id", userId)
      try {
        await cancelOrderAction(formData)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to cancel order")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isPending}
        className="bg-red-700 text-white font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-red-800 transition-colors rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Cancelling..." : "Cancel Order"}
      </button>
    </form>
  )
}
