import type { Metadata } from "next"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export const metadata: Metadata = {
  title: "Update Password — Warcraft Exports",
}

export default function UpdatePasswordPage() {
  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
