"use server"

import { revalidatePath } from "next/cache"
import { sendCancellationRequestReceiptEmail, sendCancellationRequestSellerNotification } from "@/lib/email"

export async function requestOrderCancellationAction(formData: FormData) {
  const { createServiceClient } = await import("@/lib/supabase/service")
  const supabase = createServiceClient()

  const id = formData.get("order_id") as string
  const userId = formData.get("user_id") as string
  const reason = (formData.get("reason") as string || "").trim()

  if (!reason || reason.length < 5) {
    throw new Error("Please provide a detailed cancellation reason (at least 5 characters).")
  }

  // Verify ownership and status
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id, customer_email, cancellation_requested")
    .eq("id", id)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  if (!order || (order.user_id !== userId && order.customer_email?.toLowerCase() !== user?.email?.toLowerCase())) {
    throw new Error("Unauthorized")
  }

  const status = (order.status || "confirmed").toLowerCase()
  if (["shipped", "delivered", "cancelled"].includes(status)) {
    throw new Error("Cannot request cancellation for an order that is already shipped, delivered, or cancelled.")
  }

  if (order.cancellation_requested) {
    throw new Error("A cancellation request for this order is already pending review.")
  }

  // Update DB record with cancellation request details
  await supabase
    .from("orders")
    .update({
      cancellation_requested: true,
      customer_cancellation_reason: reason,
      cancellation_request_status: "pending",
    })
    .eq("id", id)

  // Dispatch customer receipt & seller alert emails
  await sendCancellationRequestReceiptEmail(id, reason)
  await sendCancellationRequestSellerNotification(id, reason)

  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${id}`)

  return { success: true, message: "Cancellation request submitted. Management review email sent." }
}
