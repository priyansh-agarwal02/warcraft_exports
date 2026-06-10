import type { Metadata } from "next"
import { MessageSquare, Info } from "lucide-react"

export const metadata: Metadata = { title: "Chat Logs — Warcraft Exports Admin" }

export default function AdminChatPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-[28px] text-[#18181B] uppercase tracking-tight">Chat Logs</h1>
        <p className="text-[13px] font-sans text-[#71717A] mt-0.5">
          Monitor AI chatbot conversations and common customer questions.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 mb-8 flex gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-[13px] font-sans text-blue-800">
          <p className="font-bold mb-1">Chat Session Logging</p>
          <p>
            The AI chatbot currently runs stateless — each session exists only in the browser. To enable persistent chat logs,
            add a <code className="bg-blue-100 px-1 rounded text-[12px]">chat_sessions</code> table to Supabase and update{" "}
            <code className="bg-blue-100 px-1 rounded text-[12px]">/api/chat/route.ts</code> to insert rows on each exchange.
          </p>
        </div>
      </div>

      {/* Chatbot config summary */}
      <div className="bg-white border border-[#E4E4E7] p-6 mb-6">
        <h2 className="font-heading text-[16px] text-[#18181B] uppercase mb-4">Current Configuration</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px] font-sans">
          {[
            { label: "AI Model", value: "llama-3.1-8b-instant (Groq)" },
            { label: "Provider", value: "Groq Cloud API" },
            { label: "Max Response", value: "300 tokens (~150 words)" },
            { label: "Rate Limit", value: "20 messages / IP / minute" },
            { label: "Context Window", value: "Last 8 messages" },
            { label: "Fallback Email", value: "warcraftexports@gmail.com" },
          ].map(({ label, value }) => (
            <div key={label} className="border border-[#E4E4E7] p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#71717A] mb-1">{label}</dt>
              <dd className="text-[#18181B] font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Quick topics the bot handles */}
      <div className="bg-white border border-[#E4E4E7] p-6 mb-6">
        <h2 className="font-heading text-[16px] text-[#18181B] uppercase mb-4">Topics Handled by Bot</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            "Product information",
            "Sizing & fit guidance",
            "Order tracking",
            "Wholesale inquiries",
            "Shipping information",
            "Returns policy",
            "Materials & construction",
            "Payment options",
            "Contact referral",
          ].map((topic) => (
            <div key={topic} className="flex items-center gap-2 text-[13px] font-sans text-[#18181B]">
              <MessageSquare size={13} className="text-[#33450D] flex-shrink-0" />
              {topic}
            </div>
          ))}
        </div>
      </div>

      {/* Suggested questions for the bot */}
      <div className="bg-white border border-[#E4E4E7] p-6">
        <h2 className="font-heading text-[16px] text-[#18181B] uppercase mb-2">Suggested Quick Replies (in Widget)</h2>
        <p className="text-[12px] font-sans text-[#71717A] mb-4">
          These are the pre-set suggestions shown to new users when they open the chat widget.
          Edit in <code className="bg-[#F4F4F4] px-1.5 py-0.5 text-[11px]">src/components/chat/chatbot-widget.tsx</code> → SUGGESTIONS array.
        </p>
        <ul className="space-y-2">
          {[
            "What's your return policy?",
            "Do you offer wholesale pricing?",
            "How long does shipping take?",
            "What materials do you use?",
          ].map((q) => (
            <li key={q} className="flex items-center gap-2 text-[13px] font-sans text-[#18181B]">
              <span className="w-1.5 h-1.5 bg-[#33450D] rounded-full flex-shrink-0" />
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
