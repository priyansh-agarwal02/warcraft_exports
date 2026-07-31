"use client"

import { useState } from "react"
import { Eye, X, Mail, Phone, Building, Globe, Package, Calendar, Tag, CheckCircle2, Archive } from "lucide-react"

export type WholesaleInquiry = {
  id: string
  company_name: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  country: string | null
  business_type: string | null
  estimated_monthly_volume: string | null
  message: string | null
  status: string | null
  admin_notes: string | null
  created_at: string
}

interface B2BTableProps {
  inquiries: WholesaleInquiry[]
  onMarkContacted: (id: string) => Promise<void>
  onMarkClosed: (id: string) => Promise<void>
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-amber-100 text-amber-800 border-amber-200",
  in_discussion: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
}

export function B2BTable({ inquiries, onMarkContacted, onMarkClosed }: B2BTableProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<WholesaleInquiry | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleContacted(id: string) {
    setLoadingId(id)
    await onMarkContacted(id)
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: "contacted" } : null))
    }
    setLoadingId(null)
  }

  async function handleClosed(id: string) {
    setLoadingId(id)
    await onMarkClosed(id)
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status: "closed" } : null))
    }
    setLoadingId(null)
  }

  return (
    <>
      <div className="bg-white border border-[#E4E4E7] overflow-x-auto rounded-sm shadow-sm">
        <table className="w-full text-[13px] font-sans">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F8F9FA]">
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px]">Contact</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px] hidden md:table-cell">Company</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px] hidden lg:table-cell">Country</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px] hidden lg:table-cell">Est. Monthly Vol.</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px] hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px]">Status</th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[#71717A] text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E7]">
            {inquiries.map((inq) => {
              const status = inq.status ?? "pending"
              return (
                <tr key={inq.id} className="hover:bg-[#F4F4F5]/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#18181B]">{inq.contact_name ?? "—"}</p>
                    <p className="text-[11px] text-[#71717A]">{inq.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-[#3F3F46] hidden md:table-cell font-medium">{inq.company_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] hidden lg:table-cell">{inq.country ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] hidden lg:table-cell">{inq.estimated_monthly_volume ?? "—"}</td>
                  <td className="px-4 py-3 text-[#71717A] text-[12px] hidden md:table-cell">
                    {new Date(inq.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-sm ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#33450D] hover:text-[#4A5D23] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      {status !== "contacted" && status !== "closed" && (
                        <button
                          disabled={loadingId === inq.id}
                          onClick={() => handleContacted(inq.id)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Mark Contacted
                        </button>
                      )}

                      {status !== "closed" && (
                        <button
                          disabled={loadingId === inq.id}
                          onClick={() => handleClosed(inq.id)}
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B] uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {inquiries.length === 0 && (
          <div className="text-center py-12 text-[#71717A] text-[13px]">No B2B wholesale inquiries yet</div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E4E4E7] w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-[#F8F9FA] border-b border-[#E4E4E7] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl text-[#18181B] uppercase tracking-tight">Wholesale Inquiry Details</h2>
                  <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-sm ${STATUS_COLORS[selectedInquiry.status ?? "pending"] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {selectedInquiry.status ?? "pending"}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] mt-0.5">Submitted on {new Date(selectedInquiry.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-[#71717A] hover:text-[#18181B] hover:bg-gray-200/60 rounded-sm transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Buyer & Company Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAFAFA] p-4 border border-[#E4E4E7] rounded-sm">
                <div>
                  <span className="block text-[10px] font-sans font-bold uppercase text-[#71717A] mb-1 flex items-center gap-1">
                    <Mail size={12} /> Contact Info
                  </span>
                  <p className="text-sm font-bold text-[#18181B]">{selectedInquiry.contact_name || "N/A"}</p>
                  {selectedInquiry.email && (
                    <a href={`mailto:${selectedInquiry.email}`} className="text-xs text-[#33450D] hover:underline font-medium block mt-0.5">
                      {selectedInquiry.email}
                    </a>
                  )}
                  {selectedInquiry.phone && (
                    <a href={`tel:${selectedInquiry.phone}`} className="text-xs text-[#71717A] hover:underline block mt-0.5 flex items-center gap-1">
                      <Phone size={11} /> {selectedInquiry.phone}
                    </a>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] font-sans font-bold uppercase text-[#71717A] mb-1 flex items-center gap-1">
                    <Building size={12} /> Company & Location
                  </span>
                  <p className="text-sm font-bold text-[#18181B]">{selectedInquiry.company_name || "N/A"}</p>
                  <p className="text-xs text-[#71717A] mt-0.5 flex items-center gap-1">
                    <Globe size={11} /> {selectedInquiry.country || "N/A"}
                  </p>
                  {selectedInquiry.business_type && (
                    <p className="text-xs text-[#71717A] mt-0.5 capitalize flex items-center gap-1">
                      <Tag size={11} /> Type: {selectedInquiry.business_type.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Volume & Details */}
              {selectedInquiry.estimated_monthly_volume && (
                <div className="flex items-center gap-2 p-3 bg-amber-50/60 border border-amber-200/80 rounded-sm text-xs text-amber-900 font-medium">
                  <Package size={14} className="text-amber-700 shrink-0" />
                  <span>Estimated Monthly Volume: <strong>{selectedInquiry.estimated_monthly_volume}</strong></span>
                </div>
              )}

              {/* Buyer's Full Message Form Input */}
              <div>
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[#18181B] mb-2">
                  Buyer Inquiry Message
                </h3>
                <div className="p-4 bg-white border border-[#E4E4E7] rounded-sm text-xs font-sans text-[#27272A] leading-relaxed whitespace-pre-wrap min-h-[100px]">
                  {selectedInquiry.message || <span className="italic text-[#A1A1AA]">No message provided by buyer.</span>}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#F8F9FA] border-t border-[#E4E4E7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedInquiry.status !== "contacted" && selectedInquiry.status !== "closed" && (
                  <button
                    disabled={loadingId === selectedInquiry.id}
                    onClick={() => handleContacted(selectedInquiry.id)}
                    className="px-3 py-1.5 bg-amber-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <CheckCircle2 size={13} />
                    <span>Mark Contacted</span>
                  </button>
                )}

                {selectedInquiry.status !== "closed" && (
                  <button
                    disabled={loadingId === selectedInquiry.id}
                    onClick={() => handleClosed(selectedInquiry.id)}
                    className="px-3 py-1.5 bg-[#71717A] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-sm hover:bg-[#3F3F46] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Archive size={13} />
                    <span>Close Inquiry</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 border border-[#E4E4E7] text-[#71717A] text-xs font-sans font-bold uppercase tracking-wider rounded-sm hover:text-[#18181B] hover:bg-white cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
