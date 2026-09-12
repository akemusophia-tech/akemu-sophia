'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, MessageCircle, Send, Sparkles, LifeBuoy } from 'lucide-react'
import { Toaster, toast } from 'sonner'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m the Carewise support assistant. Ask me anything about your account, billing, technical issues, or general questions. I\'m here to help!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      toast.success('Response received', { duration: 2000 })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMsg)
      toast.error(errorMsg, { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="flex h-screen flex-col bg-background">
      <Toaster position="top-center" />

      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Skyline Support home">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <LifeBuoy size={18} />
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline">Skyline Support</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Live Support</p>
            <p className="text-sm text-muted-foreground">Ask any question</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary sm:px-4 sm:text-sm">
            Team <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`flex max-w-xs gap-3 sm:max-w-md lg:max-w-lg ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold sm:size-9 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {message.role === 'user' ? 'Y' : <Sparkles size={16} />}
                </span>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 sm:px-5 sm:py-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`mt-2 text-xs opacity-70 ${message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary sm:size-9">
                  <Sparkles size={16} />
                </span>
                <div className="rounded-2xl border border-border bg-background px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex gap-2">
                    <div className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                    <div className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                    <div className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-border bg-card p-4 sm:p-6">
          {error && (
            <div role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              disabled={loading}
              className="min-h-11 max-h-32 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 sm:text-base"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed sm:size-12"
              aria-label="Send message"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Powered by Gemini • Your questions help us improve support
          </p>
        </div>
      </div>
    </main>
  )
}
