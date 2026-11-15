"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "How do I track my order?",
  "What products do you offer?",
  "What promotions/coupons do you have?",
  "Which items ship from the USA?",
]

type InlineToken =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "code"; content: string }
  | { type: "link"; label: string; url: string; bold: boolean }

type BlockToken =
  | { type: "empty" }
  | { type: "hr" }
  | { type: "heading"; level: number; inlines: InlineToken[] }
  | { type: "bullet"; indent: number; inlines: InlineToken[] }
  | { type: "number"; num: string; indent: number; inlines: InlineToken[] }
  | { type: "paragraph"; inlines: InlineToken[] }

function normalizeUrl(url: string): string {
  try {
    if (
      url.startsWith("https://www.warcraftexports.com") ||
      url.startsWith("https://warcraftexports.com") ||
      url.startsWith("http://www.warcraftexports.com") ||
      url.startsWith("http://warcraftexports.com")
    ) {
      const parsed = new URL(url)
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    // fallback
  }
  return url
}

const INLINE_REGEX = /(\*\*\[[^\]]+\]\([^)]+\)\*\*|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|\*(?!\s)[^*]+(?<!\s)\*|_(?!\s)[^_]+(?<!\s)_|`[^`]+`)/g

function parseInlineTokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  INLINE_REGEX.lastIndex = 0

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) })
    }
    const tokenStr = match[0]

    const boldLinkMatch = tokenStr.match(/^\*\*\[([^\]]+)\]\(([^)]+)\)\*\*$/)
    if (boldLinkMatch) {
      tokens.push({
        type: "link",
        label: boldLinkMatch[1],
        url: normalizeUrl(boldLinkMatch[2]),
        bold: true,
      })
    } else {
      const linkMatch = tokenStr.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        tokens.push({
          type: "link",
          label: linkMatch[1],
          url: normalizeUrl(linkMatch[2]),
          bold: false,
        })
      } else {
        const boldMatch = tokenStr.match(/^\*\*([^*]+)\*\*$/) || tokenStr.match(/^__([^_]+)__$/)
        if (boldMatch) {
          tokens.push({ type: "bold", content: boldMatch[1] })
        } else {
          const italicMatch = tokenStr.match(/^\*([^*]+)\*$/) || tokenStr.match(/^_([^_]+)_$/)
          if (italicMatch) {
            tokens.push({ type: "italic", content: italicMatch[1] })
          } else {
            const codeMatch = tokenStr.match(/^`([^`]+)`$/)
            if (codeMatch) {
              tokens.push({ type: "code", content: codeMatch[1] })
            }
          }
        }
      }
    }
    lastIndex = INLINE_REGEX.lastIndex
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) })
  }

  return tokens
}

function parseBlocks(markdown: string): BlockToken[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: BlockToken[] = []

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    if (!trimmed) {
      blocks.push({ type: "empty" })
      continue
    }

    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" })
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        inlines: parseInlineTokens(headingMatch[2]),
      })
      continue
    }

    const bulletMatch = rawLine.match(/^(\s*)(?:[\*\-\+]|•)\s+(.+)$/)
    if (bulletMatch) {
      const indent = bulletMatch[1].length >= 2 ? 1 : 0
      blocks.push({
        type: "bullet",
        indent,
        inlines: parseInlineTokens(bulletMatch[2]),
      })
      continue
    }

    const numberMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.+)$/)
    if (numberMatch) {
      const indent = numberMatch[1].length >= 2 ? 1 : 0
      blocks.push({
        type: "number",
        num: numberMatch[2],
        indent,
        inlines: parseInlineTokens(numberMatch[3]),
      })
      continue
    }

    blocks.push({
      type: "paragraph",
      inlines: parseInlineTokens(trimmed),
    })
  }

  return blocks
}

function RenderInlines({ inlines, isUser }: { inlines: InlineToken[]; isUser?: boolean }) {
  return (
    <>
      {inlines.map((token, index) => {
        if (token.type === "text") {
          return <span key={index}>{token.content}</span>
        }

        if (token.type === "bold") {
          return (
            <strong
              key={index}
              className={isUser ? "font-bold text-white" : "font-bold text-stone-900"}
            >
              {token.content}
            </strong>
          )
        }

        if (token.type === "italic") {
          return (
            <em
              key={index}
              className={isUser ? "italic text-parchment/90" : "italic text-stone-700"}
            >
              {token.content}
            </em>
          )
        }

        if (token.type === "code") {
          return (
            <code
              key={index}
              className={`px-1 py-0.5 rounded text-[11px] font-mono ${
                isUser
                  ? "bg-white/20 text-white"
                  : "bg-stone-100 text-[#33450D] border border-stone-200"
              }`}
            >
              {token.content}
            </code>
          )
        }

        if (token.type === "link") {
          const isExternal =
            token.url.startsWith("http://") || token.url.startsWith("https://")

          if (isExternal) {
            return (
              <a
                key={index}
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-bold underline px-1.5 py-0.5 rounded-xs transition-colors my-0.5 ${
                  isUser
                    ? "text-white bg-white/20 hover:bg-white/30"
                    : "text-[#33450D] hover:text-[#4A5D23] bg-[#33450D]/10 hover:bg-[#33450D]/20"
                }`}
              >
                <span>{token.label}</span>
                <ExternalLink size={10} className="shrink-0" />
              </a>
            )
          }

          return (
            <Link
              key={index}
              href={token.url}
              className={`inline-flex items-center gap-1 font-bold underline px-1.5 py-0.5 rounded-xs transition-colors my-0.5 cursor-pointer ${
                isUser
                  ? "text-white bg-white/20 hover:bg-white/30"
                  : "text-[#33450D] hover:text-[#4A5D23] bg-[#33450D]/10 hover:bg-[#33450D]/20"
              }`}
            >
              <span>{token.label}</span>
              <svg
                viewBox="0 0 24 24"
                width="10"
                height="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="shrink-0"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )
        }

        return null
      })}
    </>
  )
}

function FormattedChatMessage({ content, isUser }: { content: string; isUser?: boolean }) {
  const blocks = parseBlocks(content)

  return (
    <div className="space-y-1 leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === "empty") {
          return <div key={idx} className="h-1" />
        }

        if (block.type === "hr") {
          return (
            <hr
              key={idx}
              className={`my-2 ${isUser ? "border-white/20" : "border-khaki/30"}`}
            />
          )
        }

        if (block.type === "heading") {
          return (
            <h4
              key={idx}
              className={`font-bold mt-2 mb-1 tracking-tight ${
                block.level === 1
                  ? "text-[14px]"
                  : block.level === 2
                  ? "text-[13px]"
                  : "text-[12px]"
              } ${isUser ? "text-white" : "text-stone-900"}`}
            >
              <RenderInlines inlines={block.inlines} isUser={isUser} />
            </h4>
          )
        }

        if (block.type === "bullet") {
          return (
            <div
              key={idx}
              className={`flex items-start gap-1.5 my-0.5 ${
                block.indent ? "ml-3 text-[12px] opacity-90" : "ml-0.5"
              }`}
            >
              <span
                className={`font-bold select-none mt-1 shrink-0 text-[10px] leading-none ${
                  isUser ? "text-white/80" : "text-[#33450D]"
                }`}
              >
                {block.indent ? "◦" : "•"}
              </span>
              <span className="flex-1">
                <RenderInlines inlines={block.inlines} isUser={isUser} />
              </span>
            </div>
          )
        }

        if (block.type === "number") {
          return (
            <div
              key={idx}
              className={`flex items-start gap-1.5 my-0.5 ${
                block.indent ? "ml-3 text-[12px] opacity-90" : "ml-0.5"
              }`}
            >
              <span
                className={`font-semibold text-[11px] shrink-0 mt-0.5 select-none ${
                  isUser ? "text-white/90" : "text-[#33450D]"
                }`}
              >
                {block.num}.
              </span>
              <span className="flex-1">
                <RenderInlines inlines={block.inlines} isUser={isUser} />
              </span>
            </div>
          )
        }

        return (
          <p key={idx} className="my-0.5">
            <RenderInlines inlines={block.inlines} isUser={isUser} />
          </p>
        )
      })}
    </div>
  )
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [showGreeting, setShowGreeting] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! Welcome to Warcraft Exports 👋 I'm Warex, your personal AI assistant. How can I help you today? Feel free to ask about our historical reproduction gear, order tracking, shipping, or active promotions!" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      setShowGreeting(false)
    }
  }, [messages, open])

  // Repeating greeting bubble cycle: shows for 3s, hides/collapses, waits 60s, repeats
  useEffect(() => {
    if (open) return

    const showDuration = 3000 // 3 seconds visible
    const hideDuration = 60000 // 60 seconds hidden (1 minute)

    const triggerCycle = () => {
      setShowGreeting(true)
      return setTimeout(() => {
        setShowGreeting(false)
      }, showDuration)
    }

    let hideTimeout = triggerCycle()

    const intervalId = setInterval(() => {
      hideTimeout = triggerCycle()
    }, showDuration + hideDuration)

    return () => {
      clearTimeout(hideTimeout)
      clearInterval(intervalId)
    }
  }, [open])

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
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please visit [Contact Us](/contact) or email warcraftexports@gmail.com." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Greeting Bubble next to chatbot icon */}
      <AnimatePresence>
        {showGreeting && !open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 0.2, 
              x: 80, 
              y: 5,
              transition: { duration: 0.4, ease: "easeIn" }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => {
              setOpen(true)
              setShowGreeting(false)
            }}
            data-chat-launcher
            className="fixed bottom-[32px] right-[88px] z-50 bg-[#33450D] text-parchment px-4 py-2.5 shadow-2xl border border-khaki/30 text-xs font-sans font-bold flex items-center gap-2 cursor-pointer select-none rounded-sm hover:bg-[#4A5D23] transition-colors"
            style={{ originX: 1, originY: 0.5 }}
          >
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-[#33450D]" />
            <span>Hi! I&apos;m Warex AI</span>
            <span className="text-[10px] opacity-60">👋</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        data-chat-launcher
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-leather-dark text-parchment flex items-center justify-center shadow-xl hover:bg-leather transition-colors rounded-sm focus:outline-none cursor-pointer"
        aria-label="Chat with us"
        animate={{
          y: open ? 0 : [0, -6, 0]
        }}
        transition={open ? { duration: 0.2 } : {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.951 7.951 0 01-4-.018L5.5 20.5l.518-2.5A7.962 7.962 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/></svg>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-[84px] right-6 z-50 w-[350px] sm:w-[360px] max-w-[calc(100vw-2rem)] h-[430px] sm:h-[450px] max-h-[calc(100vh-120px)] bg-white shadow-2xl border border-khaki/40 flex flex-col origin-bottom-right rounded-sm overflow-hidden" 
          >
            {/* Header */}
            <div className="bg-leather-dark px-4 py-3 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-parchment font-sans font-bold text-[13px]">Warex AI · Support Assistant</p>
                <p className="text-parchment/60 text-[10px] font-sans">Warcraft Exports Catalog & Orders</p>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="text-parchment/60 hover:text-parchment transition-colors focus:outline-none p-1 cursor-pointer"
                aria-label="Close chat"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 text-[13px] font-sans rounded-sm ${
                      msg.role === "user"
                        ? "bg-leather-dark text-parchment"
                        : "bg-white border border-khaki/30 text-leather-dark shadow-xs"
                    }`}
                  >
                    <FormattedChatMessage content={msg.content} isUser={msg.role === "user"} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-khaki/30 px-3.5 py-2.5 text-[12px] text-leather/70 italic rounded-sm shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#33450D] animate-ping" />
                    <span>Warex is searching catalog...</span>
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
                    className="text-[10px] font-sans px-2.5 py-1 border border-leather/30 text-leather hover:bg-leather hover:text-parchment transition-colors rounded-sm cursor-pointer font-medium"
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
                placeholder="Ask about products, orders, leggings..."
                className="flex-1 text-[13px] font-sans px-3 py-2 border border-khaki/40 focus:border-leather focus:outline-none bg-[#FAFAFA] text-leather-dark placeholder:text-khaki/80 rounded-sm"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-leather-dark text-parchment px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-wide hover:bg-leather transition-colors disabled:opacity-40 rounded-sm cursor-pointer"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
