"use client"
import { useState, useRef, useEffect } from "react"

type Message = { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "How do I track my order?",
  "What promotions/coupons do you have?",
  "Which items ship from the USA?",
  "What's your return policy?",
]

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm the Warcraft Exports assistant. How can I help you today? I can answer questions about our WW1/WW2 reproduction gear, shipping, sizing, and more." }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput("")
    const newMessages: Message[] = [...messages, { role: "user", content }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json() as { reply: string }
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please email warcraftexports@gmail.com." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-leather-dark text-parchment flex items-center justify-center shadow-xl hover:bg-leather transition-colors"
        aria-label="Chat with us"
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.951 7.951 0 01-4-.018L5.5 20.5l.518-2.5A7.962 7.962 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/></svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white shadow-2xl border border-khaki/40 flex flex-col" style={{ height: "460px" }}>
          {/* Header */}
          <div className="bg-leather-dark px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="flex-1">
              <p className="text-parchment font-sans font-bold text-[13px]">Warcraft Exports Support</p>
              <p className="text-parchment/60 text-[10px] font-sans">Powered by AI · Typically instant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 text-[13px] font-sans leading-relaxed ${
                    msg.role === "user"
                      ? "bg-leather-dark text-parchment"
                      : "bg-white border border-khaki/30 text-leather-dark"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-khaki/30 px-3 py-2 text-[13px] text-khaki italic">
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions (only when first opened) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 border-t border-khaki/20 bg-white flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] font-sans px-2 py-1 border border-leather/30 text-leather hover:bg-leather hover:text-parchment transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-khaki/30 bg-white p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask a question…"
              className="flex-1 text-[13px] font-sans px-3 py-2 border border-khaki/40 focus:border-leather focus:outline-none bg-[#FAFAFA] text-leather-dark placeholder:text-khaki"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-leather-dark text-parchment px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-wide hover:bg-leather transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
