import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase/service"

/**
 * Admin Product Images API
 * Handles adding images to products via the admin panel.
 * Replaces direct client-side Supabase REST calls for security.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json() as {
      product_id: string
      url: string
      alt_text?: string
      sort_order?: number
      is_hero?: boolean
    }

    if (!body.product_id || !body.url) {
      return NextResponse.json({ error: "product_id and url are required" }, { status: 400 })
    }

    // Basic URL validation
    if (!body.url.startsWith("https://")) {
      return NextResponse.json({ error: "Image URL must use HTTPS" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from("product_images")
      .insert([{
        product_id: body.product_id,
        url: body.url,
        alt_text: body.alt_text || null,
        sort_order: body.sort_order ?? 0,
        is_hero: body.is_hero ?? false,
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Fetch image record to retrieve the URL
    const { data: imgData, error: fetchError } = await supabase
      .from("product_images")
      .select("url")
      .eq("id", id)
      .single()

    if (fetchError || !imgData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // 2. Delete the record from Supabase
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // 3. Optional: Delete from UploadThing if it is an UploadThing URL
    const url = imgData.url
    if (url && (url.includes("uploadthing") || url.includes("utfs.io"))) {
      try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split("/")
        const key = pathParts[pathParts.length - 1]
        if (key && key.length > 10) {
          const { UTApi } = require("uploadthing/server")
          const utapi = new UTApi({
            token: process.env.UPLOADTHING_TOKEN,
          })
          await utapi.deleteFiles(key)
        }
      } catch (utError) {
        console.error("Failed to delete file from UploadThing storage:", utError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete image" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json() as {
      id: string
      product_id: string
      is_hero: boolean
    }

    if (!body.id || !body.product_id) {
      return NextResponse.json({ error: "id and product_id are required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    if (body.is_hero) {
      await supabase
        .from("product_images")
        .update({ is_hero: false })
        .eq("product_id", body.product_id)
    }

    const { data, error } = await supabase
      .from("product_images")
      .update({ is_hero: body.is_hero })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
  }
}
