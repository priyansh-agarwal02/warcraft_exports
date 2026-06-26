import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { UTApi } from "uploadthing/server"

export async function POST(request: Request) {
  try {
    // 1. Authorize user
    const auth = await requireAdmin()
    if (auth.error) {
      return NextResponse.json({ error: "Unauthorized: Admin privilege required" }, { status: 401 })
    }

    // 2. Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 3. Verify file type & size (failsafe)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 4MB limit" }, { status: 400 })
    }

    // 4. Initialize UTApi
    const utapi = new UTApi({
      token: process.env.UPLOADTHING_TOKEN,
    })

    // 5. Upload file
    const uploadResult = await utapi.uploadFiles([file])
    const result = uploadResult[0]

    if (result.error) {
      console.error("UploadThing server upload error:", result.error)
      return NextResponse.json({ error: result.error.message || "Failed to upload file to UploadThing" }, { status: 500 })
    }

    if (!result.data) {
      return NextResponse.json({ error: "No upload data returned" }, { status: 500 })
    }

    // 6. Return upload details
    return NextResponse.json({
      url: result.data.url,
      key: result.data.key,
      name: result.data.name || file.name,
    })
  } catch (error: any) {
    console.error("Upload API route catch-all error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
