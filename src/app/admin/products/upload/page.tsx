"use client"

import { useState, useRef } from "react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"

type ParsedRow = Record<string, string | number>

export default function AdminBulkUploadPage() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "uploading" | "done" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setStatus("parsing")
    setRows([])
    setHeaders([])

    try {
      const XLSX = await import("xlsx")
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<ParsedRow>(ws, { defval: "" })
      if (data.length === 0) {
        setStatus("error")
        setMessage("No rows found in the file.")
        return
      }
      setHeaders(Object.keys(data[0]))
      setRows(data.slice(0, 100))
      setStatus("ready")
      setMessage(`${data.length} rows detected. Showing first ${Math.min(data.length, 100)}.`)
    } catch {
      setStatus("error")
      setMessage("Failed to parse file. Make sure it is a valid .xlsx or .csv file.")
    }
  }

  async function handleUpload() {
    if (rows.length === 0) return
    setStatus("uploading")
    try {
      const res = await fetch("/api/admin/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus("done")
      setMessage(`${rows.length} products submitted for import.`)
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Upload failed.")
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Bulk Upload</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">Import products from CSV or Excel spreadsheet</p>
      </div>

      {/* Instructions */}
      <div className="bg-white border border-[#E4E4E7] p-6 mb-6">
        <h2 className="font-heading text-[15px] text-[#18181B] uppercase mb-3">Instructions</h2>
        <ol className="list-decimal list-inside space-y-1.5 font-sans text-[13px] text-[#71717A]">
          <li>Prepare a <strong className="text-[#18181B]">.xlsx</strong> or <strong className="text-[#18181B]">.csv</strong> file with one product per row.</li>
          <li>Required columns: <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">name</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">sku</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">price_usd</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">stock_quantity</span></li>
          <li>Optional columns: <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">description</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">nation</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">era</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">category_slug</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">sale_price_usd</span>, <span className="font-mono text-[12px] bg-[#F4F4F4] px-1">weight_kg</span></li>
          <li>Upload and preview the data, then click <strong className="text-[#18181B]">Import Products</strong>.</li>
        </ol>
      </div>

      {/* File input */}
      <div className="bg-white border border-[#E4E4E7] p-6 mb-6">
        <div
          className="border-2 border-dashed border-[#E4E4E7] rounded-sm p-12 text-center cursor-pointer hover:border-[#33450D] transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <FileSpreadsheet size={40} className="text-[#D4D4D8] mx-auto mb-3" />
          <p className="font-sans font-bold text-[14px] text-[#18181B] mb-1">
            {fileName || "Click to select file"}
          </p>
          <p className="font-sans text-[12px] text-[#A1A1AA]">Supports .xlsx and .csv</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv,.xls"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {status !== "idle" && (
          <div className={`mt-4 flex items-center gap-2 font-sans text-[13px] ${status === "error" ? "text-red-600" : status === "done" ? "text-green-600" : "text-[#71717A]"}`}>
            {status === "error" && <AlertCircle size={14} />}
            {status === "done" && <CheckCircle size={14} />}
            {status === "parsing" && <Upload size={14} className="animate-bounce" />}
            <span>{status === "parsing" ? "Parsing file…" : status === "uploading" ? "Uploading…" : message}</span>
          </div>
        )}
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="bg-white border border-[#E4E4E7] overflow-x-auto mb-6">
          <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
            <h2 className="font-heading text-[15px] text-[#18181B] uppercase">Preview ({rows.length} rows)</h2>
            <button
              onClick={handleUpload}
              disabled={status === "uploading" || status === "done"}
              className="bg-[#33450D] text-white text-[12px] font-sans font-bold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-[#4A5D23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "uploading" ? "Importing…" : "Import Products"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] font-sans">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#F4F4F4]">
                  {headers.map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-bold uppercase tracking-wide text-[#71717A] text-[10px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F4]">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFA]">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2 text-[#18181B] max-w-[160px] truncate whitespace-nowrap">{String(row[h] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
