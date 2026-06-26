import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductEditForm } from "@/components/admin/product-edit-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = { params: Promise<{ id: string }> }

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  if (id === "new") {
    const { data: cats } = await supabase.from("categories").select("id, name, slug").order("name")
    return (
      <div className="p-4 sm:p-8">
        <Link href="/admin/products" className="flex items-center gap-2 text-[12px] font-sans text-[#71717A] hover:text-[#18181B] mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to Products
        </Link>
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight mb-6">Add New Product</h1>
        <ProductEditForm categories={cats ?? []} />
      </div>
    )
  }

  const { data: product } = await supabase
    .from("products")
    .select(`*, category:categories!category_id(id, name, slug), images:product_images(id, url, alt_text, sort_order, is_hero), variants:product_variants(id, color, size, sku_suffix, price_override, stock_quantity, is_active)`)
    .eq("id", id)
    .single()

  if (!product) notFound()

  const { data: cats } = await supabase.from("categories").select("id, name, slug").order("name")

  let categoryIds: string[] = []
  try {
    const { data: rels } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", product.id)
    categoryIds = rels?.map((pc: any) => pc.category_id).filter(Boolean) || []
  } catch {
    // Ignore
  }

  if (categoryIds.length === 0 && product.category_id) {
    categoryIds = [product.category_id]
  }

  const productWithCategoryIds = product ? {
    ...product,
    category_ids: categoryIds
  } : undefined

  return (
    <div className="p-4 sm:p-8">
      <Link href="/admin/products" className="flex items-center gap-2 text-[12px] font-sans text-[#71717A] hover:text-[#18181B] mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Products
      </Link>
      <h1 className="font-heading text-[24px] text-[#18181B] uppercase tracking-tight mb-1">Edit Product</h1>
      <p className="text-[12px] font-sans text-[#71717A] mb-6">{product.name} · {product.sku}</p>
      <ProductEditForm product={productWithCategoryIds} categories={cats ?? []} />
    </div>
  )
}
