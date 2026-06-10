import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceHeaders = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { category_ids, ...body } = await req.json()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: "POST",
    headers: serviceHeaders,
    body: JSON.stringify([body]),
  })
  if (!res.ok) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }
  const data = await res.json()
  const product = data?.[0]

  if (product?.id && Array.isArray(category_ids)) {
    const joinInserts = category_ids.map((catId: string) => ({
      product_id: product.id,
      category_id: catId,
    }))
    if (joinInserts.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/product_categories`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify(joinInserts),
      })
    }
  }

  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id, category_ids, ...body } = await req.json()
  if (!id || !UUID_RE.test(String(id))) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 })
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: "PATCH",
    headers: serviceHeaders,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  if (Array.isArray(category_ids)) {
    // Delete existing categories first
    await fetch(`${SUPABASE_URL}/rest/v1/product_categories?product_id=eq.${id}`, {
      method: "DELETE",
      headers: serviceHeaders,
    })

    // Insert new categories
    const joinInserts = category_ids.map((catId: string) => ({
      product_id: id,
      category_id: catId,
    }))
    if (joinInserts.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/product_categories`, {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify(joinInserts),
      })
    }
  }

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 })
  }

  await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/product_images?product_id=eq.${id}`, { method: "DELETE", headers: serviceHeaders }),
    fetch(`${SUPABASE_URL}/rest/v1/product_variants?product_id=eq.${id}`, { method: "DELETE", headers: serviceHeaders }),
  ])

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: "DELETE", headers: serviceHeaders })
  return NextResponse.json({ ok: true }, { status: res.status })
}
