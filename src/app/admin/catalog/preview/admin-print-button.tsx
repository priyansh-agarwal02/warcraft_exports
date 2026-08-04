"use client"

import { Printer, Download } from 'lucide-react'

export function AdminCatalogPrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 bg-[#33450D] hover:bg-[#27350A] text-white text-[12px] font-bold uppercase tracking-wider rounded-sm shadow-md transition-all border border-[#A3E635]/30"
    >
      <Printer size={16} />
      <span>Print / Download PDF</span>
      <Download size={14} className="opacity-80 ml-1" />
    </button>
  )
}
