"use client"

import { useState, useTransition } from "react"
import { requestOrderCancellationAction } from "@/app/(store)/account/orders/[id]/actions"

type CancelOrderButtonProps = {
  orderId: string
  userId: string
  cancellationRequested?: boolean
  cancellationRequestStatus?: string | null
}

export function CancelOrderButton({
  orderId,
  userId,
  cancellationRequested,
  cancellationRequestStatus,
}: CancelOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [isPending, startTransition] = useTransition()

  if (cancellationRequested || cancellationRequestStatus === "pending") {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-sm text-xs font-sans space-y-1">
        <strong className="block font-bold text-amber-900 uppercase tracking-wide">
          ⏳ Cancellation Request Pending Review
        </strong>
        <p className="text-amber-800/80">
          Your cancellation request has been submitted and is currently under review by our workshop management team. An email update will be sent to you shortly.
        </p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for cancelling your order.")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("order_id", orderId)
      formData.append("user_id", userId)
      formData.append("reason", reason)

      try {
        const res = await requestOrderCancellationAction(formData)
        setSuccessMsg(res.message || "Cancellation request submitted.")
        setIsOpen(false)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to submit request.")
      }
    })
  }

  return (
    <div>
      {successMsg ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-sm text-xs font-sans">
          {successMsg}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-red-700 text-white font-sans font-bold text-[11px] uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-red-800 active:scale-[0.97] transition-all duration-200 shadow-xs hover:shadow-md rounded-sm cursor-pointer"
        >
          Request Order Cancellation
        </button>
      )}

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-canvas border border-khaki/30 max-w-md w-full p-6 rounded-sm shadow-xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-khaki/20 pb-3">
              <h3 className="font-heading text-base text-leather-dark uppercase font-black">
                Request Order Cancellation
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-khaki hover:text-leather-dark text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-leather-dark/70 leading-relaxed">
              Cancellation requests require approval by management to ensure your order has not already been packed or dispatched. Please specify your reason below.
            </p>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 text-xs rounded-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-leather-dark mb-1">
                  Reason for Cancellation <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  placeholder="e.g. Accidentally ordered duplicate item / Changed size requirement..."
                  className="w-full border border-khaki/40 p-2.5 text-xs bg-parchment text-leather-dark focus:border-leather focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold text-khaki hover:text-leather-dark uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 hover:bg-red-800 transition-colors rounded-sm disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : "Submit Cancellation Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
