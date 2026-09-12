import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ticketSchema = z.object({
  requesterName: z.string().trim().min(2).max(100),
  requesterEmail: z.string().trim().email().max(200),
  subject: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(1).max(50),
  urgency: z.enum(['Low', 'Normal', 'High', 'Critical']),
})

const analysisSchema = z.object({
  category: z.string().default('General'),
  summary: z.string().default('Support request received.'),
  sentiment: z.string().default('Neutral'),
  urgency: z.string().default('Normal'),
  suggestedPriority: z.string().default('Normal'),
  nextSteps: z.array(z.string()).default([]),
})

function referenceNumber() {
  return `SKY-${Math.random().toString(36).slice(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`
}

export async function POST(request: Request) {
  try {
    const parsed = ticketSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 })

    const input = parsed.data
    let analysis = analysisSchema.parse({ category: input.category, urgency: input.urgency, suggestedPriority: input.urgency })
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      try {
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `Analyze this support ticket. Return only JSON with keys category, summary, sentiment, urgency, suggestedPriority, nextSteps.\n${JSON.stringify(input)}` }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
        })
        if (geminiResponse.ok) {
          const data = await geminiResponse.json()
          const text = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')
          if (text) analysis = analysisSchema.parse(JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim()))
        }
      } catch (error) {
        console.error('[v0] Ticket analysis failed, using submitted fields:', error)
      }
    }

    const supabase = await createClient()
    const ticket = {
      reference_number: referenceNumber(),
      requester_name: input.requesterName,
      requester_email: input.requesterEmail,
      subject: input.subject,
      description: input.description,
      category: analysis.category || input.category,
      urgency: input.urgency,
      status: 'Open',
      ai_summary: analysis.summary,
      ai_sentiment: analysis.sentiment,
      ai_suggested_priority: analysis.suggestedPriority,
      ai_next_steps: analysis.nextSteps,
    }
    const { data, error } = await supabase.from('tickets').insert(ticket).select('reference_number').single()
    if (error) throw error
    return NextResponse.json({ referenceNumber: data.reference_number })
  } catch (error) {
    console.error('[v0] Ticket creation failed', error)
    return NextResponse.json({ error: 'We could not submit your request right now. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load tickets.' }, { status: 500 })
  return NextResponse.json({ tickets: data })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const id = z.string().uuid().safeParse(body.id)
  const status = z.enum(['Open', 'In Progress', 'Resolved']).safeParse(body.status)
  if (!id.success || !status.success) return NextResponse.json({ error: 'Invalid ticket update.' }, { status: 400 })
  const supabase = await createClient()
  const { error } = await supabase.from('tickets').update({ status: status.data, updated_at: new Date().toISOString() }).eq('id', id.data)
  if (error) return NextResponse.json({ error: 'Unable to update ticket.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
