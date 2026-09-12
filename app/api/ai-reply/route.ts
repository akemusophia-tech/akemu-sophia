import { gateway, generateText } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  ticket: z.object({
    requesterName: z.string().trim().min(1).max(100),
    subject: z.string().trim().min(1).max(160),
    category: z.string().trim().min(1).max(50),
    urgency: z.string().trim().min(1).max(20),
    description: z.string().trim().min(1).max(5000),
  }),
  history: z.array(z.object({ role: z.enum(['customer', 'assistant', 'agent']), content: z.string().max(2000) })).max(20).default([]),
  message: z.string().trim().max(2000).default(''),
})

const responseSchema = z.object({
  reply: z.string().trim().min(1).max(3000),
  nextAction: z.string().trim().min(1).max(240),
})

const requestCounts = new Map<string, { count: number; resetAt: number }>()

function allowed(key: string) {
  const now = Date.now()
  const current = requestCounts.get(key)
  if (!current || current.resetAt < now) {
    requestCounts.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (current.count >= 12) return false
  current.count += 1
  return true
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Please provide a valid ticket message.' }, { status: 400 })

  const key = parsed.data.ticket.subject.toLowerCase().slice(0, 160)
  if (!allowed(key)) return NextResponse.json({ error: 'Too many replies for this ticket. Please wait a minute.' }, { status: 429 })

  try {
    const { ticket, history, message } = parsed.data
    const result = await generateText({
      model: gateway('google/gemini-3.5-flash'),
      system: 'You are Carewise support copilot. Draft calm, specific, human replies. Never invent refunds, guarantees, timelines, account changes, or policy exceptions. If details are missing, ask one focused question. Return only JSON with reply and nextAction.',
      prompt: JSON.stringify({ ticket, conversation: [...history, ...(message ? [{ role: 'agent', content: message }] : [])] }),
    })
    const clean = result.text.replace(/^```json\s*|\s*```$/g, '').trim()
    const response = responseSchema.parse(JSON.parse(clean))
    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] AI reply failed', error)
    return NextResponse.json({ error: 'The assistant is unavailable. Try again or write a reply manually.' }, { status: 503 })
  }
}
