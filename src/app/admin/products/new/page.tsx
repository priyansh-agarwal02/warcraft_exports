import { createClient } from "@/lib/supabase/server"
import { ProductEditForm } from "@/components/admin/product-edit-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: cats } = await supabase.from("categories").select("id, name, slug").order("name")

  return (
    <div className="p-8">
      <Link href="/admin/products" className="flex items-center gap-2 text-[12px] font-sans text-[#71717A] hover:text-[#18181B] mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Products
      </Link>
      <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight mb-6">Add New Product</h1>
      <ProductEditForm categories={cats ?? []} />
    </div>
  )
}
