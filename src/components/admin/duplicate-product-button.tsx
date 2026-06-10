"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Copy, Loader2 } from "lucide-react"
import { duplicateProduct } from "@/app/admin/actions"

interface DuplicateProductButtonProps {
  productId: string
  variant?: "icon" | "button"
}

export function DuplicateProductButton({ productId, variant = "icon" }: DuplicateProductButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleDuplicate() {
    if (variant === "button" && !confirm("Are you sure you want to duplicate this product?")) {
      return
    }
    
    try {
      const res = await duplicateProduct(productId)
      if (res?.success && res.newProductId) {
        router.push(`/admin/products/${res.newProductId}`)
      } else {
        alert("Failed to duplicate product. Please try again.")
      }
    } catch (e: any) {
      console.error(e)
      alert(`Error: ${e.message || "Failed to duplicate product"}`)
    }
  }

  if (variant === "button") {
    return (
      <button
        onClick={() => startTransition(handleDuplicate)}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 border border-[#E4E4E7] text-[#18181B] text-[12px] font-sans font-bold uppercase tracking-[0.12em] py-3 hover:border-[#33450D] hover:text-[#33450D] transition-colors disabled:opacity-50 cursor-pointer bg-white"
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={14} />
        ) : (
          <Copy size={14} />
        )}
        {isPending ? "Duplicating…" : "Duplicate Product"}
      </button>
    )
  }

  return (
    <button
      onClick={() => startTransition(handleDuplicate)}
      disabled={isPending}
      className="p-1.5 text-[#71717A] hover:text-[#BBAC48] hover:bg-[#F4F4F4] rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
      title="Duplicate Product"
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={14} />
      ) : (
        <Copy size={14} />
      )}
    </button>
  )
}
