"use client"

import { useState, useTransition, useEffect } from "react"
import {
  updateOrderStatusAction,
  updateOrderTrackingAction,
  resendOrderEmailAction,
  acceptCancellationRequestAction,
  rejectCancellationRequestAction,
} from "@/app/admin/actions"
import { Loader2, CheckCircle2, AlertCircle, Mail, Send, ShieldAlert, Truck, Info, XCircle } from "lucide-react"

interface OrderFulfillmentManagerProps {
  orderId: string
  orderNumber: string
  currentStatus: string
  trackingNumber: string | null
  trackingUrl: string | null
  customerEmail: string
  shippedEmailSentAt: string | null
  deliveredEmailSentAt: string | null
  cancelledEmailSentAt: string | null
  cancellationReason: string | null
  cancellationRequested?: boolean
  customerCancellationReason?: string | null
  cancellationRequestStatus?: string | null
  cancellationRejectionReason?: string | null
}

const GENERAL_STATUSES = [
  { value: "confirmed", label: "Confirmed (Paid & Processing)" },
  { value: "shipped", label: "Shipped (In Transit)" },
  { value: "delivered", label: "Delivered (Handed to Customer)" },
  { value: "cancelled", label: "Cancelled" },
]

export function OrderFulfillmentManager({
  orderId,
  orderNumber,
  currentStatus,
  trackingNumber,
  trackingUrl,
  customerEmail,
  shippedEmailSentAt,
  deliveredEmailSentAt,
  cancelledEmailSentAt,
  cancellationReason: initialReason,
  cancellationRequested,
  customerCancellationReason,
  cancellationRequestStatus,
  cancellationRejectionReason,
}: OrderFulfillmentManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus)

  useEffect(() => {
    setSelectedStatus(currentStatus)
  }, [currentStatus])

  useEffect(() => {
    if (trackingNumber) setInputTrackingNumber(trackingNumber)
    if (trackingUrl) setInputCustomUrl(trackingUrl)
  }, [trackingNumber, trackingUrl])
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReasonText, setRejectionReasonText] = useState("Your order has already been processed at our Kanpur workshop and prepared for carrier dispatch, so it cannot be cancelled.")
  const [carrier, setCarrier] = useState<string>(() => {
    if (!trackingUrl) return "dhl"
    if (trackingUrl.includes("dhl.com")) return "dhl"
    if (trackingUrl.includes("fedex.com")) return "fedex"
    if (trackingUrl.includes("usps.com")) return "usps"
    if (trackingUrl.includes("shipglobal.in")) return "shipglobal"
    return "custom"
  })
  const [inputTrackingNumber, setInputTrackingNumber] = useState<string>(trackingNumber ?? "")
  const [inputCustomUrl, setInputCustomUrl] = useState<string>(trackingUrl ?? "")

  // Cancellation Reason State
  const defaultCancelReason = `Your order #${orderNumber} has been cancelled by store management upon request. If you have any questions or require a refund update, please reply directly to this email.`
  const [cancelReasonText, setCancelReasonText] = useState<string>(initialReason || defaultCancelReason)

  // Alert Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [resendCooldown, setResendCooldown] = useState<boolean>(false)
  const [trackingError, setTrackingError] = useState<boolean>(false)

  // Workflow Check: Cannot jump from 'confirmed' to 'delivered'
  const isDeliveredBlocked = currentStatus === "confirmed" && selectedStatus === "delivered"
  // Shipped status selection guard
  const isShippedSelected = selectedStatus === "shipped"
  const isSameStatusSelected = selectedStatus === currentStatus
  const isAlreadyShipped = currentStatus === "shipped" || !!shippedEmailSentAt

  // Handler 1: General Status Update (Confirmed, Delivered, Cancelled)
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setTrackingError(false)

    if (isDeliveredBlocked) {
      setFeedback({
        type: "error",
        message: "Workflow Restriction: An order cannot be marked as Delivered directly from Confirmed status. Please enter tracking info and mark as Shipped first.",
      })
      return
    }

    startTransition(async () => {
      const res = await updateOrderStatusAction({
        orderId,
        status: selectedStatus,
        cancellationReason: selectedStatus === "cancelled" ? cancelReasonText : undefined,
      })

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Order status updated successfully." })
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update order status." })
      }
    })
  }

  // Handler 2: Mark as Shipped (Fulfillment & Tracking with Mandatory Validation)
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setTrackingError(false)

    // Mandatory Tracking Number Validation
    if (!inputTrackingNumber.trim()) {
      setTrackingError(true)
      setFeedback({
        type: "error",
        message: "⚠️ Tracking Number is required to mark an order as Shipped.",
      })
      return
    }

    startTransition(async () => {
      const res = await updateOrderTrackingAction({
        orderId,
        carrier,
        trackingNumber: inputTrackingNumber,
        customTrackingUrl: inputCustomUrl,
        forceResendEmail: false, // Default: idempotent check
      })

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Tracking saved & order marked as Shipped." })
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save tracking details." })
      }
    })
  }

  // Handler 3: Manual Resend Email Override with Business Notice
  const handleManualResend = (type: "shipped" | "delivered" | "cancelled") => {
    if (resendCooldown) return
    const confirmed = window.confirm(
      `BUSINESS NOTICE OVERRIDE:\nAre you sure you want to resend the ${type.toUpperCase()} notification email to ${customerEmail}? Use this option only if details were changed.`
    )
    if (!confirmed) return

    setFeedback(null)
    setResendCooldown(true)
    setTimeout(() => setResendCooldown(false), 60000) // 60s cooldown

    startTransition(async () => {
      const res = await resendOrderEmailAction({
        orderId,
        emailType: type,
        cancellationReason: type === "cancelled" ? cancelReasonText : undefined,
      })

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Notification email resent." })
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to resend email." })
      }
    })
  }

  // Handler 4: Accept Customer Cancellation Request
  const handleAcceptCancellation = () => {
    if (!confirm("Are you sure you want to ACCEPT this customer cancellation request? The order status will be set to CANCELLED and a cancellation email dispatched to the customer.")) {
      return
    }
    setFeedback(null)
    startTransition(async () => {
      const res = await acceptCancellationRequestAction({ orderId })
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Cancellation accepted." })
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to accept cancellation." })
      }
    })
  }

  // Handler 5: Reject Customer Cancellation Request
  const handleRejectCancellation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectionReasonText.trim()) {
      setFeedback({ type: "error", message: "Rejection reason is mandatory." })
      return
    }
    setFeedback(null)
    startTransition(async () => {
      const res = await rejectCancellationRequestAction({ orderId, rejectionReason: rejectionReasonText })
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Cancellation rejected." })
        setRejecting(false)
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to reject cancellation." })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Alert Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 border font-sans text-[13px] flex items-start gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
              : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#166534] mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-[#991B1B] mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
        </div>
      )}

      {/* PENDING CANCELLATION REQUEST CARD */}
      {cancellationRequested && cancellationRequestStatus === "pending" && (
        <div className="bg-[#FFF5F5] border-2 border-[#E53E3E] p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#FEB2B2] pb-3">
            <ShieldAlert className="w-5 h-5 text-[#C53030] shrink-0" />
            <h2 className="font-heading text-[15px] text-[#9B2C2C] uppercase font-black tracking-tight">
              Action Required: Customer Requested Order Cancellation
            </h2>
          </div>

          <div className="bg-white border border-[#FEB2B2] p-4 text-[13px] font-sans text-[#2D3748] space-y-2">
            <p className="font-bold text-[#9B2C2C] uppercase text-[11px] tracking-wider">
              Reason Submitted by Customer:
            </p>
            <p className="italic bg-[#FFF5F5] p-3 border-l-4 border-[#E53E3E] text-[#4A5568]">
              "{customerCancellationReason || "No specific reason provided."}"
            </p>
          </div>

          {!rejecting ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAcceptCancellation}
                disabled={isPending}
                className="flex-1 bg-[#C53030] text-white px-4 py-3 text-[12px] font-sans font-bold uppercase tracking-wider hover:bg-[#9B2C2C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Cancellation & Refund</span>
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={isPending}
                className="flex-1 bg-white border border-[#C53030] text-[#C53030] px-4 py-3 text-[12px] font-sans font-bold uppercase tracking-wider hover:bg-[#FFF5F5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Cancellation Request</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleRejectCancellation} className="bg-white border border-[#FEB2B2] p-4 space-y-3">
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#9B2C2C]">
                Rejection Explanation (Sent in Customer Email) <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                disabled={isPending}
                rows={3}
                className="w-full border border-[#CBD5E0] p-2.5 text-[12px] font-sans text-[#1A202C] focus:border-[#C53030] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  disabled={isPending}
                  className="px-3 py-2 text-[11px] font-sans font-semibold text-[#718096] uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#C53030] text-white px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-wider hover:bg-[#9B2C2C] disabled:opacity-50"
                >
                  {isPending ? "Rejecting..." : "Confirm Rejection & Dispatch Email"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* SECTION 1: General Status Update */}
      <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-[#F4F4F4] pb-3">
          <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-tight">
            Order Status Update
          </h2>
          <span className="text-[11px] font-sans font-bold uppercase tracking-wide px-2.5 py-1 bg-[#F4F4F4] text-[#33450D] border border-[#E4E4E7]">
            Current: {currentStatus}
          </span>
        </div>

        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {currentStatus === "delivered" ? (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-3.5 text-[12px] font-sans text-[#166534] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
              <span>Order has been <strong>DELIVERED</strong>. This order is finalized and cannot be reverted or cancelled.</span>
            </div>
          ) : currentStatus === "cancelled" ? (
            <div className="bg-[#FEF2F2] border border-[#FECACA] p-3.5 text-[12px] font-sans text-[#991B1B] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
              <span>Order has been <strong>CANCELLED</strong>. This order is finalized and cannot be reopened.</span>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1.5">
                  General Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isPending}
                  className="w-full border border-[#E4E4E7] px-3.5 py-2.5 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white font-medium disabled:opacity-50"
                >
                  {GENERAL_STATUSES.filter((s) => {
                    // Hide 'shipped' as a target option from 'confirmed' (must use Section 2 with mandatory tracking)
                    if (currentStatus === "confirmed" && s.value === "shipped") return false
                    // Forward-only rule: If currently 'shipped', hide 'confirmed'
                    if (currentStatus === "shipped" && s.value === "confirmed") return false
                    return true
                  }).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#71717A] mt-1">
                  Note: To mark an order as <strong>Shipped</strong> or update tracking info, use Section 2 below with mandatory tracking details.
                </p>
              </div>

              {/* JIRA Restriction Warning */}
              {isDeliveredBlocked && (
                <div className="bg-amber-50 border border-amber-200 p-3 text-[12px] font-sans text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Workflow Guard:</strong> An order cannot be marked as <strong>Delivered</strong> directly from <strong>Confirmed</strong> status. Use Section 2 to enter tracking info and mark as <strong>Shipped</strong> first.
                  </span>
                </div>
              )}

              {/* Cancellation Reason Box */}
              {selectedStatus === "cancelled" && (
                <div className="bg-[#FFF5F5] border border-[#FEB2B2] p-4 space-y-2">
                  <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#991B1B]">
                    Cancellation Reason (Formatted into Customer Email)
                  </label>
                  <textarea
                    value={cancelReasonText}
                    onChange={(e) => setCancelReasonText(e.target.value)}
                    disabled={isPending}
                    rows={3}
                    className="w-full border border-[#FCA5A5] p-2.5 text-[12px] font-sans text-[#18181B] bg-white focus:border-[#991B1B] focus:outline-none"
                    placeholder="Enter custom cancellation reason..."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || isDeliveredBlocked || isSameStatusSelected || isShippedSelected}
                className="w-full bg-[#18181B] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-4 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Status...</span>
                  </>
                ) : isSameStatusSelected ? (
                  <span>No Status Change</span>
                ) : isShippedSelected ? (
                  <span>No Status Change</span>
                ) : (
                  <span>Save Status Update</span>
                )}
              </button>
            </>
          )}
        </form>
      </div>

      {/* SECTION 2: Fulfillment & Tracking (Mark as Shipped) */}
      <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs space-y-4">
        <h2 className="font-heading text-[15px] text-[#18181B] uppercase tracking-tight border-b border-[#F4F4F4] pb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#33450D]" />
          <span>{isAlreadyShipped ? "Fulfillment & Tracking (Order Shipped)" : "Fulfillment & Tracking (Mark as Shipped)"}</span>
        </h2>

        <form onSubmit={handleShippingSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
              Shipping Carrier
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              disabled={isPending}
              className="w-full border border-[#E4E4E7] px-3.5 py-2.5 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white font-medium disabled:opacity-50"
            >
              <option value="dhl">DHL Express</option>
              <option value="fedex">FedEx</option>
              <option value="usps">USPS</option>
              <option value="shipglobal">Ship Global</option>
              <option value="custom">Custom Link / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
              Tracking Number <span className="text-red-600">* (MANDATORY)</span>
            </label>
            <input
              type="text"
              value={inputTrackingNumber}
              onChange={(e) => {
                setInputTrackingNumber(e.target.value)
                if (trackingError) setTrackingError(false)
              }}
              disabled={isPending}
              placeholder="e.g. 9876543210"
              className={`w-full border px-3.5 py-2.5 text-[13px] font-sans focus:outline-none bg-white font-mono disabled:opacity-50 ${
                trackingError ? "border-red-500 ring-1 ring-red-500" : "border-[#E4E4E7] focus:border-[#33450D]"
              }`}
            />
            {trackingError && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">
                Tracking number is mandatory to mark an order as Shipped.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A] mb-1">
              Custom Tracking URL (Optional)
            </label>
            <input
              type="url"
              value={inputCustomUrl}
              onChange={(e) => setInputCustomUrl(e.target.value)}
              disabled={isPending}
              placeholder="https://..."
              className="w-full border border-[#E4E4E7] px-3.5 py-2.5 text-[13px] font-sans focus:border-[#33450D] focus:outline-none bg-white disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-4 py-3 hover:bg-[#4A5D23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAlreadyShipped ? "Saving Tracking Details..." : "Saving & Dispatching Email..."}</span>
              </>
            ) : (
              <span>{isAlreadyShipped ? "Save Tracking Updates" : "Save & Mark as Shipped"}</span>
            )}
          </button>
        </form>

        {/* Business Notice & Email Override Button */}
        {shippedEmailSentAt && (
          <div className="mt-4 pt-4 border-t border-[#E4E4E7] space-y-3">
            <div className="bg-[#F9F6F0] p-3.5 border border-[#E8DCC8] text-[11px] font-sans text-[#3B2A1A] space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#8B4513]">
                <Info className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>Business Notice — Tracking Update Email Override</span>
              </div>
              <p className="leading-normal text-[#6B5A3E]">
                Shipping confirmation email was previously dispatched to customer on <strong>{new Date(shippedEmailSentAt).toLocaleString()}</strong>.
                Use the override button below ONLY if tracking details were modified due to a carrier or entry change and an updated tracking email must be resent.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleManualResend("shipped")}
              disabled={isPending || resendCooldown}
              className="w-full bg-white border border-[#33450D] text-[#33450D] px-4 py-2.5 text-[11px] font-sans font-bold uppercase tracking-wider hover:bg-[#33450D] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{resendCooldown ? "Resend Cooldown (60s)..." : "Resend Updated Tracking Email to Customer"}</span>
            </button>
          </div>
        )}
      </div>

      {/* SECTION 3: Email Dispatch Log */}
      <div className="bg-white border border-[#E4E4E7] p-6 shadow-xs space-y-3">
        <h2 className="font-heading text-[14px] text-[#18181B] uppercase tracking-tight border-b border-[#F4F4F4] pb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#33450D]" />
          <span>Email Dispatch History</span>
        </h2>

        <div className="space-y-2 font-sans text-[12px]">
          <div className="flex justify-between py-1.5 border-b border-[#F4F4F4]">
            <span className="text-[#71717A]">Shipping Email:</span>
            <span className="font-semibold text-[#18181B]">
              {shippedEmailSentAt ? `Sent ${new Date(shippedEmailSentAt).toLocaleDateString()}` : "Not sent yet"}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#F4F4F4]">
            <span className="text-[#71717A]">Delivery Email:</span>
            <span className="font-semibold text-[#18181B]">
              {deliveredEmailSentAt ? `Sent ${new Date(deliveredEmailSentAt).toLocaleDateString()}` : "Not sent yet"}
            </span>
          </div>
          {currentStatus === "cancelled" && (
            <div className="flex justify-between py-1.5">
              <span className="text-[#991B1B]">Cancelled Email:</span>
              <span className="font-semibold text-[#991B1B]">
                {cancelledEmailSentAt ? `Sent ${new Date(cancelledEmailSentAt).toLocaleDateString()}` : "Not sent yet"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
