"use client"

import { Trash2 } from "lucide-react"

interface DeletePromoButtonProps {
  action: (formData: FormData) => Promise<void>
  id: string
  confirmMessage: string
}

export function DeletePromoButton({ action, id, confirmMessage }: DeletePromoButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Delete"
        className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </form>
  )
}
