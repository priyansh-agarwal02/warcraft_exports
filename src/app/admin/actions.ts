"use server"

import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin-auth"

export async function updateOrderStatus(orderId: string, status: string) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error("Unauthorized")

  const supabase = createServiceClient()
  await supabase.from("orders").update({ status }).eq("id", orderId)
  revalidatePath("/admin")
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

