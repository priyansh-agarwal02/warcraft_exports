import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

// M-1 FIX: Lazy-evaluate service credentials at request time, not module parse time
function getServiceConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return {
    url,
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    } as Record<string, string>,
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const svc = getServiceConfig()
  const { category_ids, ...body } = await req.json()
  const res = await fetch(`${svc.url}/rest/v1/products`, {
    method: "POST",
    headers: svc.headers,
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
      await fetch(`${svc.url}/rest/v1/product_categories`, {
        method: "POST",
        headers: svc.headers,
        body: JSON.stringify(joinInserts),
      })
    }
  }

  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const svc = getServiceConfig()
  const { id, category_ids, ...body } = await req.json()
  if (!id || !UUID_RE.test(String(id))) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 })
  }
  const res = await fetch(`${svc.url}/rest/v1/products?id=eq.${id}`, {
    method: "PATCH",
    headers: svc.headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  if (Array.isArray(category_ids)) {
    // Delete existing categories first
    await fetch(`${svc.url}/rest/v1/product_categories?product_id=eq.${id}`, {
      method: "DELETE",
      headers: svc.headers,
    })

    // Insert new categories
    const joinInserts = category_ids.map((catId: string) => ({
      product_id: id,
      category_id: catId,
    }))
    if (joinInserts.length > 0) {
      await fetch(`${svc.url}/rest/v1/product_categories`, {
        method: "POST",
        headers: svc.headers,
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

  const svc = getServiceConfig()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Missing or invalid id" }, { status: 400 })
  }

  await Promise.all([
    fetch(`${svc.url}/rest/v1/product_images?product_id=eq.${id}`, { method: "DELETE", headers: svc.headers }),
    fetch(`${svc.url}/rest/v1/product_variants?product_id=eq.${id}`, { method: "DELETE", headers: svc.headers }),
  ])

  const res = await fetch(`${svc.url}/rest/v1/products?id=eq.${id}`, { method: "DELETE", headers: svc.headers })
  return NextResponse.json({ ok: true }, { status: res.status })
}
