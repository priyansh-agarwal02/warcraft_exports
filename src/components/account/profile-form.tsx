"use client"

import { useState, useEffect } from "react"
import { PhoneInput } from "@/components/ui/phone-input"
import { parsePhoneNumber } from "@/lib/phone"

interface ProfileFormProps {
  initialProfile: {
    full_name: string | null
    email: string | null
    phone: string | null
  }
  updateAction: (formData: FormData) => Promise<void>
}

const INPUT = "w-full border border-khaki/60 bg-parchment/60 px-3 py-2.5 font-sans text-sm text-leather-dark placeholder-khaki/70 focus:outline-none focus:border-leather transition-colors"

export function ProfileForm({ initialProfile, updateAction }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name ?? "")
  const [countryCode, setCountryCode] = useState("US")
  const [phonePrefix, setPhonePrefix] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse phone number on load
  useEffect(() => {
    if (initialProfile.phone) {
      const parsed = parsePhoneNumber(initialProfile.phone)
      setCountryCode(parsed.code)
      setPhonePrefix(parsed.prefix)
      setPhoneNumber(parsed.number)
    }
  }, [initialProfile.phone])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const fullPhoneNumber = `${phonePrefix}${phoneNumber.trim().replace(/\s+/g, "")}`
      
      const formData = new FormData()
      formData.append("full_name", fullName)
      formData.append("phone", fullPhoneNumber)

      await updateAction(formData)
      setSuccess(true)
    } catch {
      setError("Failed to update profile settings.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Full Name</label>
        <input
          name="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Smith"
          className={INPUT}
          required
        />
      </div>

      <div>
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Email Address</label>
        <input
          type="email"
          value={initialProfile.email ?? ""}
          disabled
          className={`${INPUT} opacity-60 cursor-not-allowed`}
          readOnly
        />
        <p className="text-[11px] font-sans text-khaki mt-1">Email cannot be changed here. Contact support to update.</p>
      </div>

      <div>
        <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-leather mb-1.5">Phone / WhatsApp</label>
        <PhoneInput
          countryCode={countryCode}
          numberValue={phoneNumber}
          onCountryChange={(code, prefix) => {
            setCountryCode(code)
            setPhonePrefix(prefix)
          }}
          onNumberChange={setPhoneNumber}
          placeholder="555 000 0000"
          required={true}
        />
      </div>

      {success && (
        <p className="text-green-700 text-sm font-sans font-semibold">Profile settings updated successfully!</p>
      )}

      {error && (
        <p className="text-red-600 text-sm font-sans">{error}</p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-leather text-parchment font-sans font-bold text-[12px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-leather-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving Changes…" : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
