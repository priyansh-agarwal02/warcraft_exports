"use server"

import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin-auth"
import { sendOrderShippedEmail } from "@/lib/email"

export async function updateOrderStatusAction(data: {
  orderId: string
  status: string
  cancellationReason?: string
  forceResendEmail?: boolean
}): Promise<{ success: boolean; error?: string; message?: string; emailSent?: boolean }> {
  const auth = await requireAdmin()
  if (auth.error) return { success: false, error: "Unauthorized" }

  const { orderId, status, cancellationReason, forceResendEmail } = data
  const supabase = createServiceClient()

  // 1. Fetch current order details
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, tracking_number, customer_email, shipped_email_sent_at, delivered_email_sent_at, cancelled_email_sent_at")
    .eq("id", orderId)
    .single()

  if (fetchErr || !order) {
    return { success: false, error: "Order not found" }
  }

  // 2. Strict Forward-Only Workflow Validation
  const currentStatus = (order.status || "confirmed").toLowerCase()
  const targetStatus = status.toLowerCase()

  if (currentStatus === targetStatus) {
    return { success: true, message: `Order is already in ${currentStatus.toUpperCase()} status.` }
  }

  if (currentStatus === "cancelled") {
    return { success: false, error: "Workflow Guard: Cancelled orders are finalized and cannot be changed to another status." }
  }

  if (currentStatus === "delivered") {
    return { success: false, error: "Workflow Guard: Delivered orders are finalized and cannot be moved backwards or cancelled." }
  }

  if (currentStatus === "shipped" && targetStatus === "confirmed") {
    return { success: false, error: "Workflow Guard: Shipped orders cannot be moved backwards to Confirmed status." }
  }

  if (currentStatus === "confirmed" && targetStatus === "delivered") {
    return { success: false, error: "Workflow Guard: Order cannot be marked as Delivered directly from Confirmed. Please enter tracking information and mark as Shipped first." }
  }

  // 3. Update database status
  const updatePayload: Record<string, any> = { status }
  if (status === "cancelled" && cancellationReason) {
    updatePayload.cancellation_reason = cancellationReason
  }

  await supabase.from("orders").update(updatePayload).eq("id", orderId)

  // 4. Trigger Email Dispatch with Idempotency Safety
  let emailResult: { sent: boolean; reason?: string } = { sent: false, reason: "" }
  let userMessage = `Order status updated to ${status.toUpperCase()}.`

  if (status === "shipped") {
    if (!order.tracking_number) {
      userMessage = `Order status updated to SHIPPED. (Note: Add tracking details to dispatch shipping email).`
    } else {
      emailResult = await sendOrderShippedEmail(orderId, !!forceResendEmail)
      if (emailResult.sent) {
        userMessage = `Order marked as SHIPPED. Shipping confirmation email sent to ${order.customer_email}.`
      } else if (emailResult.reason === "already_sent") {
        userMessage = `Order updated to SHIPPED. (Shipping email was already sent previously to ${order.customer_email}).`
      }
    }
  } else if (status === "delivered") {
    const { sendOrderDeliveredEmail } = await import("@/lib/email")
    emailResult = await sendOrderDeliveredEmail(orderId, !!forceResendEmail)
    if (emailResult.sent) {
      userMessage = `Order marked as DELIVERED. Delivery confirmation email sent to ${order.customer_email}.`
    } else if (emailResult.reason === "already_sent") {
      userMessage = `Order updated to DELIVERED. (Delivery email was already sent previously).`
    }
  } else if (status === "cancelled") {
    const { sendOrderCancelledEmail } = await import("@/lib/email")
    emailResult = await sendOrderCancelledEmail(orderId, cancellationReason, !!forceResendEmail)
    if (emailResult.sent) {
      userMessage = `Order CANCELLED. Cancellation email with custom reason sent to ${order.customer_email}.`
    } else if (emailResult.reason === "already_sent") {
      userMessage = `Order status updated to CANCELLED. (Cancellation email was already sent previously).`
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)

  return { success: true, message: userMessage, emailSent: emailResult.sent }
}

export async function updateOrderTrackingAction(data: {
  orderId: string
  carrier: string
  trackingNumber: string
  customTrackingUrl?: string
  forceResendEmail?: boolean
}): Promise<{ success: boolean; error?: string; message?: string; emailSent?: boolean }> {
  const auth = await requireAdmin()
  if (auth.error) return { success: false, error: "Unauthorized" }

  const { orderId, carrier, trackingNumber, customTrackingUrl, forceResendEmail } = data
  const trimmedTracking = trackingNumber.trim()
  if (!trimmedTracking) {
    return { success: false, error: "Tracking number is required." }
  }

  let trackingUrl = ""
  if (carrier === "dhl") {
    trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trimmedTracking}`
  } else if (carrier === "fedex") {
    trackingUrl = `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trimmedTracking}`
  } else if (carrier === "usps") {
    trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trimmedTracking}`
  } else if (carrier === "shipglobal") {
    trackingUrl = `https://www.shipglobal.in/track?tracking_id=${trimmedTracking}`
  } else if (carrier === "custom") {
    trackingUrl = customTrackingUrl?.trim() || ""
  }

  const supabase = createServiceClient()

  // Fetch current order to check status & email status
  const { data: order } = await supabase
    .from("orders")
    .select("status, customer_email, shipped_email_sent_at")
    .eq("id", orderId)
    .single()

  const currentStatusLower = (order?.status || "").toLowerCase()
  if (currentStatusLower === "cancelled" || currentStatusLower === "delivered") {
    return { success: false, error: `Workflow Guard: Cannot update tracking or mark as Shipped for an order that is already ${currentStatusLower.toUpperCase()}.` }
  }

  await supabase
    .from("orders")
    .update({
      tracking_number: trimmedTracking,
      tracking_url: trackingUrl,
      status: "shipped",
    })
    .eq("id", orderId)

  const { sendOrderShippedEmail } = await import("@/lib/email")
  const emailResult = await sendOrderShippedEmail(orderId, !!forceResendEmail)

  let userMessage = `Tracking details saved & Order marked as SHIPPED.`
  if (emailResult.sent) {
    userMessage = `Tracking details saved & Shipping confirmation email sent to ${order?.customer_email}.`
  } else if (emailResult.reason === "already_sent") {
    userMessage = `Tracking details updated & saved successfully ✓ (Shipping email was sent previously; use override button below if you wish to resend).`
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)

  return { success: true, message: userMessage, emailSent: emailResult.sent }
}

export async function resendOrderEmailAction(data: {
  orderId: string
  emailType: "shipped" | "delivered" | "cancelled"
  cancellationReason?: string
}): Promise<{ success: boolean; error?: string; message?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { success: false, error: "Unauthorized" }

  const { orderId, emailType, cancellationReason } = data
  const supabase = createServiceClient()

  const { data: order } = await supabase.from("orders").select("customer_email").eq("id", orderId).single()
  if (!order) return { success: false, error: "Order not found" }

  if (emailType === "shipped") {
    const { sendOrderShippedEmail } = await import("@/lib/email")
    const res = await sendOrderShippedEmail(orderId, true)
    if (!res.sent) return { success: false, error: "Failed to resend shipping email. Ensure tracking number exists." }
  } else if (emailType === "delivered") {
    const { sendOrderDeliveredEmail } = await import("@/lib/email")
    const res = await sendOrderDeliveredEmail(orderId, true)
    if (!res.sent) return { success: false, error: "Failed to resend delivery email." }
  } else if (emailType === "cancelled") {
    const { sendOrderCancelledEmail } = await import("@/lib/email")
    const res = await sendOrderCancelledEmail(orderId, cancellationReason, true)
    if (!res.sent) return { success: false, error: "Failed to resend cancellation email." }
  }

  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true, message: `Notification email successfully resent to ${order.customer_email}.` }
}

export async function duplicateProduct(productId: string) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error("Unauthorized")

  const supabase = createServiceClient()

  // 1. Fetch the source product details
  const { data: product, error: productErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single()

  if (productErr || !product) {
    throw new Error(`Product not found: ${productErr?.message || "unknown"}`)
  }

  // 2. Fetch related items
  const [imagesRes, categoriesRes, variantsRes] = await Promise.all([
    supabase.from("product_images").select("*").eq("product_id", productId),
    supabase.from("product_categories").select("*").eq("product_id", productId),
    supabase.from("product_variants").select("*").eq("product_id", productId),
  ])

  // 3. Create a unique SKU and unique Slug for the cloned product
  const uniqueSuffix = Math.floor(1000 + Math.random() * 9000)
  const newSku = `${product.sku}-COPY-${uniqueSuffix}`
  const newSlug = `${product.slug}-copy-${uniqueSuffix}`
  const newName = `${product.name} (Copy)`

  // Remove primary key and timestamps
  const { id, created_at, updated_at, ...productFields } = product
  
  // 4. Insert the new product as draft (is_active = false)
  const { data: newProduct, error: insertErr } = await supabase
    .from("products")
    .insert({
      ...productFields,
      name: newName,
      sku: newSku,
      amazon_sku: newSku,
      slug: newSlug,
      is_active: false,
    })
    .select()
    .single()

  if (insertErr || !newProduct) {
    throw new Error(`Failed to insert duplicated product: ${insertErr?.message || "unknown"}`)
  }

  const newProductId = newProduct.id

  // 5. Clone related images
  if (imagesRes.data && imagesRes.data.length > 0) {
    const newImages = imagesRes.data.map(({ id: _, created_at: __, product_id: ___, ...imgFields }) => ({
      ...imgFields,
      product_id: newProductId,
    }))
    const { error: imgErr } = await supabase.from("product_images").insert(newImages)
    if (imgErr) console.error("Failed to copy product images:", imgErr.message)
  }

  // 6. Clone category relations
  if (categoriesRes.data && categoriesRes.data.length > 0) {
    const newCategories = categoriesRes.data.map(({ id: _, created_at: __, product_id: ___, ...catFields }) => ({
      ...catFields,
      product_id: newProductId,
    }))
    const { error: catErr } = await supabase.from("product_categories").insert(newCategories)
    if (catErr) console.error("Failed to copy product categories:", catErr.message)
  }

  // 7. Clone variants
  if (variantsRes.data && variantsRes.data.length > 0) {
    const newVariants = variantsRes.data.map(({ id: _, created_at: __, product_id: ___, ...varFields }) => {
      const oldSkuSuffix = varFields.sku_suffix || ""
      const newSkuSuffix = oldSkuSuffix ? `${oldSkuSuffix}-C` : "C"
      return {
        ...varFields,
        product_id: newProductId,
        sku_suffix: newSkuSuffix,
      }
    })
    const { error: varErr } = await supabase.from("product_variants").insert(newVariants)
    if (varErr) console.error("Failed to copy product variants:", varErr.message)
  }

  revalidatePath("/admin/products")
  
  return { success: true, newProductId }
}

export async function acceptCancellationRequestAction({ orderId }: { orderId: string }): Promise<{ success: boolean; error?: string; message?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { success: false, error: "Unauthorized" }

  const supabase = createServiceClient()

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, order_number, customer_email, customer_cancellation_reason")
    .eq("id", orderId)
    .single()

  if (fetchErr || !order) return { success: false, error: "Order not found" }

  const reason = order.customer_cancellation_reason || "Cancellation request approved by store management."

  await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancellation_request_status: "approved",
      cancellation_reason: reason,
      cancelled_email_sent_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  const { sendOrderCancelledEmail } = await import("@/lib/email")
  await sendOrderCancelledEmail(orderId, reason, true)

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)

  return { success: true, message: `Cancellation request accepted. Order marked as Cancelled & notification email sent to ${order.customer_email}.` }
}

export async function rejectCancellationRequestAction({
  orderId,
  rejectionReason,
}: {
  orderId: string
  rejectionReason: string
}): Promise<{ success: boolean; error?: string; message?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { success: false, error: "Unauthorized" }

  const cleanReason = (rejectionReason || "").trim()
  if (!cleanReason) {
    return { success: false, error: "Rejection reason is mandatory." }
  }

  const supabase = createServiceClient()

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, order_number, customer_email")
    .eq("id", orderId)
    .single()

  if (fetchErr || !order) return { success: false, error: "Order not found" }

  await supabase
    .from("orders")
    .update({
      cancellation_request_status: "rejected",
      cancellation_rejection_reason: cleanReason,
    })
    .eq("id", orderId)

  const { sendCancellationRejectedEmail } = await import("@/lib/email")
  await sendCancellationRejectedEmail(orderId, cleanReason)

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)

  return { success: true, message: `Cancellation request rejected. Explanation email dispatched to ${order.customer_email}.` }
}


