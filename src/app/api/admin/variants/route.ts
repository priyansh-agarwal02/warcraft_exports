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

  try {
    const svc = getServiceConfig()
    const body = await req.json()
    const { product_id, color, size, sku_suffix, price_override, stock_quantity, image_url, is_active } = body

    if (!product_id || !UUID_RE.test(String(product_id))) {
      return NextResponse.json({ error: "Missing or invalid product_id" }, { status: 400 })
    }

    const payload = {
      product_id,
      color: color || null,
      size: size || null,
      sku_suffix: sku_suffix || null,
      price_override: price_override != null && price_override !== "" ? Number(price_override) : null,
      stock_quantity: stock_quantity != null ? Number(stock_quantity) : 0,
      image_url: image_url || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    }

    const res = await fetch(`${svc.url}/rest/v1/product_variants`, {
      method: "POST",
      headers: svc.headers,
      body: JSON.stringify([payload]),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ variant: data?.[0] ?? data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create variant" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const svc = getServiceConfig()
    const body = await req.json()
    const { id, color, size, sku_suffix, price_override, stock_quantity, image_url, is_active } = body

    if (!id || !UUID_RE.test(String(id))) {
      return NextResponse.json({ error: "Missing or invalid variant id" }, { status: 400 })
    }

    const payload: Record<string, any> = {}
    if (color !== undefined) payload.color = color || null
    if (size !== undefined) payload.size = size || null
    if (sku_suffix !== undefined) payload.sku_suffix = sku_suffix || null
    if (price_override !== undefined) payload.price_override = price_override !== null && price_override !== "" ? Number(price_override) : null
    if (stock_quantity !== undefined) payload.stock_quantity = Number(stock_quantity)
    if (image_url !== undefined) payload.image_url = image_url || null
    if (is_active !== undefined) payload.is_active = Boolean(is_active)

    const res = await fetch(`${svc.url}/rest/v1/product_variants?id=eq.${id}`, {
      method: "PATCH",
      headers: svc.headers,
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({ variant: data?.[0] ?? data }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update variant" }, { status: 500 })
  }
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

  const res = await fetch(`${svc.url}/rest/v1/product_variants?id=eq.${id}`, {
    method: "DELETE",
    headers: svc.headers,
  })

  return NextResponse.json({ ok: true }, { status: res.status })
}

