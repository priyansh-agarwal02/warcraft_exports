import { createUploadthing, type FileRouter } from "uploadthing/next"
import { requireAdmin } from "@/lib/admin-auth"

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      const auth = await requireAdmin()
      if (auth.error) {
        throw new Error("Unauthorized: Admin privilege required")
      }
      return { userId: auth.userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed for admin:", metadata.userId)
      console.log("Uploaded file URL:", file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
