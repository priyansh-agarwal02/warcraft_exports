import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In — Warcraft Exports",
}

export default function LoginPage() {
  return (
    <div 
      className="min-h-[85vh] bg-cover bg-center bg-no-repeat relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url('/hero/wholesale-bg-opt.jpg')` }}
    >
      {/* Dark overlay for contrast and focus */}
      <div className="absolute inset-0 bg-[#1E140C]/60 backdrop-blur-[1.5px]" />
      
      <div className="relative z-10 w-full max-w-md my-auto">
        <LoginForm />
      </div>
    </div>
  )
}
