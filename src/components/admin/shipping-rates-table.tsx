"use client"

import { useState, useTransition } from "react"
import { saveRate, deleteRate } from "@/app/admin/shipping/actions"

type ShippingRate = {
  id: string
  country_code: string
  country_name: string
  standard_days: string
  standard_price: number
  express_days: string
  express_price: number
  free_threshold: number
}

interface ShippingRatesTableProps {
  rates: ShippingRate[]
}

export function ShippingRatesTable({ rates }: ShippingRatesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [editForm, setEditForm] = useState<{
    country_code: string
    country_name: string
    standard_price: string
    standard_days: string
    express_price: string
    express_days: string
    free_threshold: string
  }>({
    country_code: "",
    country_name: "",
    standard_price: "",
    standard_days: "",
    express_price: "",
    express_days: "",
    free_threshold: "",
  })

  const handleEditClick = (e: React.MouseEvent, rate: ShippingRate) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(rate.id)
    setEditForm({
      country_code: rate.country_code,
      country_name: rate.country_name,
      standard_price: String(rate.standard_price),
      standard_days: rate.standard_days,
      express_price: String(rate.express_price),
      express_days: rate.express_days,
      free_threshold: String(rate.free_threshold),
    })
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSubmit = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!editingId) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("id", editingId)
      formData.append("country_code", editForm.country_code)
      formData.append("country_name", editForm.country_name)
      formData.append("standard_price", editForm.standard_price)
      formData.append("standard_days", editForm.standard_days)
      formData.append("express_price", editForm.express_price)
      formData.append("express_days", editForm.express_days)
      formData.append("free_threshold", editForm.free_threshold)

      try {
        await saveRate(formData)
        setEditingId(null)
      } catch (err) {
        alert("Failed to save shipping rate updates.")
        console.error(err)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveSubmit(e)
    }
  }

  const handleDeleteSubmit = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this shipping rate?")) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append("id", id)
      try {
        await deleteRate(formData)
      } catch (err) {
        alert("Failed to delete shipping rate.")
        console.error(err)
      }
    })
  }

  const INPUT = "w-full border border-khaki/60 bg-white px-2 py-1 text-xs font-sans text-leather-dark focus:outline-none focus:border-leather"

  return (
    <div className="bg-white border border-[#E4E4E7] overflow-x-auto mb-8 animate-custom-fade-in">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[22%]">Country</th>
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[12%]">Standard Rate</th>
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[14%]">Standard Time</th>
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[12%]">Express Rate</th>
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[14%]">Express Time</th>
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[12%]">Free At</th>
            <th className="text-left text-[11px] font-sans font-bold uppercase tracking-widest text-[#71717A] px-4 py-3 w-[14%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F4F4F4]">
          {rates.map((rate) => {
            const isEditing = rate.id === editingId
            return (
              <tr key={rate.id} className="hover:bg-[#F4F4F4] transition-colors">
                {/* Country Name & Code */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        name="country_name"
                        type="text"
                        required
                        value={editForm.country_name}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className={INPUT}
                        placeholder="Country Name"
                      />
                      <input
                        name="country_code"
                        type="text"
                        required
                        value={editForm.country_code}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className={`${INPUT} font-mono`}
                        placeholder="Code (e.g. US)"
                        maxLength={10}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-[13px] font-sans font-semibold text-[#18181B]">{rate.country_name}</p>
                      <p className="text-[11px] font-mono text-[#71717A]">{rate.country_code}</p>
                    </>
                  )}
                </td>

                {/* Standard Price */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      name="standard_price"
                      type="number"
                      step="0.01"
                      required
                      value={editForm.standard_price}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className={INPUT}
                    />
                  ) : (
                    <p className="text-[13px] font-sans font-semibold text-[#18181B]">${Number(rate.standard_price).toFixed(2)}</p>
                  )}
                </td>

                {/* Standard Days */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      name="standard_days"
                      type="text"
                      required
                      value={editForm.standard_days}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className={INPUT}
                      placeholder="e.g. 7-14"
                    />
                  ) : (
                    <p className="text-[13px] font-sans text-[#71717A]">{rate.standard_days} days</p>
                  )}
                </td>

                {/* Express Price */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      name="express_price"
                      type="number"
                      step="0.01"
                      required
                      value={editForm.express_price}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className={INPUT}
                    />
                  ) : (
                    <p className="text-[13px] font-sans font-semibold text-[#18181B]">${Number(rate.express_price).toFixed(2)}</p>
                  )}
                </td>

                {/* Express Days */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      name="express_days"
                      type="text"
                      required
                      value={editForm.express_days}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className={INPUT}
                      placeholder="e.g. 3-5"
                    />
                  ) : (
                    <p className="text-[13px] font-sans text-[#71717A]">{rate.express_days} days</p>
                  )}
                </td>

                {/* Free Threshold */}
                <td className="px-4 py-3">
                  {isEditing ? (
                    <input
                      name="free_threshold"
                      type="number"
                      step="1"
                      required
                      value={editForm.free_threshold}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className={INPUT}
                    />
                  ) : (
                    <p className="text-[13px] font-sans text-[#33450D] font-semibold">${Number(rate.free_threshold).toFixed(0)}+</p>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveSubmit}
                          disabled={isPending}
                          className="text-[11px] font-sans font-bold uppercase tracking-wide text-green-700 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelClick}
                          className="text-[11px] font-sans font-bold uppercase tracking-wide text-gray-500 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleEditClick(e, rate)}
                          className="text-[11px] font-sans font-bold uppercase tracking-wide text-blue-600 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSubmit(e, rate.id)}
                          className="text-[11px] font-sans font-bold uppercase tracking-wide text-red-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
