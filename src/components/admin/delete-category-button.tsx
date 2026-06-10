"use client"

import { Trash2 } from "lucide-react"

interface DeleteCategoryButtonProps {
  id: string
  name: string
  action: (formData: FormData) => Promise<void>
}

export function DeleteCategoryButton({ id, name, action }: DeleteCategoryButtonProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`Delete "${name}"? This will unlink all products from this category.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-1.5 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
        title="Delete category"
      >
        <Trash2 size={14} />
      </button>
    </form>
  )
}
