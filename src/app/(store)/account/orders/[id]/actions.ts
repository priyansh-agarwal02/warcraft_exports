"use server"

import { revalidatePath } from "next/cache"

export async function cancelOrderAction(formData: FormData) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()
  const id = formData.get("order_id") as string
  const userId = formData.get("user_id") as string

  // Verify ownership and status
  const { data: order } = await supabase
    .from("orders")
    .select("status, user_id")
    .eq("id", id)
    .single()

  if (!order || order.user_id !== userId) {
    throw new Error("Unauthorized")
  }

  if (["shipped", "delivered", "cancelled"].includes(order.status ?? "pending")) {
    throw new Error("Cannot cancel order in its current state")
  }

  await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id)

  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${id}`)
}
