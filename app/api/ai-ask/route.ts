import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant']),
        content: z.string().max(3000),
        timestamp: z.union([z.string(), z.date()]),
      }),
    )
    .max(50)
    .default([]),
})

const responseSchema = z.object({
  reply: z.string().trim().min(1).max(3000),
})

const requestCounts = new Map<string, { count: number; resetAt: number }>()

function allowed(ip: string) {
  const now = Date.now()
  const current = requestCounts.get(ip)
  if (!current || current.resetAt < now) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (current.count >= 30) return false
  current.count += 1
  return true
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid message.' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  if (!allowed(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before asking again.' },
      { status: 429 },
    )
  }

  try {
    const { message, history } = parsed.data
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('[v0] GEMINI_API_KEY is not configured')
      return NextResponse.json({ error: 'The assistant is not configured yet.' }, { status: 503 })
    }

    const conversationContext = history
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n')

    const prompt = [
      'You are Carewise support assistant. Provide helpful, accurate answers to customer questions.',
      'Keep responses concise (1-2 paragraphs), friendly, and professional.',
      'If you don\'t know something, be honest and suggest contacting support@skyline.example',
      'Never invent policies, guarantees, or timelines.',
      '',
      'Conversation history:',
      conversationContext,
      '',
      `User: ${message}`,
      'Assistant:',
    ].join('\n')

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    })

    if (!response.ok) {
      console.error('[v0] Gemini request failed', response.status, await response.text())
      return NextResponse.json({ error: 'Gemini could not respond right now. Try again.' }, { status: 503 })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')

    if (!text) throw new Error('Gemini returned an empty response')

    const result = responseSchema.parse({ reply: text.trim() })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] AI ask failed', error)
    return NextResponse.json(
      { error: 'The assistant is unavailable. Try again in a moment.' },
      { status: 503 },
    )
  }
}
