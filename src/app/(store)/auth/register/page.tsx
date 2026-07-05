import type { Metadata } from "next"
import { headers } from "next/headers"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account — Warcraft Exports",
}

export default async function RegisterPage() {
  const headersList = await headers()
  const defaultCountry = headersList.get("x-vercel-ip-country") || "US"

  return (
    <div className="bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RegisterForm defaultCountry={defaultCountry} />
      </div>
    </div>
  )
}
