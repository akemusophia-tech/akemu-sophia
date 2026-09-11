'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, LifeBuoy, LockKeyhole, Mail, MessageSquareText, ShieldCheck } from 'lucide-react'

const initialForm = { requesterName: '', requesterEmail: '', subject: '', description: '', category: 'General', urgency: 'Normal' }

export default function Page() {
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [reference, setReference] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    const response = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    if (!response.ok) { setState('error'); return }
    setReference(data.referenceNumber)
    setForm(initialForm)
    setState('success')
  }

  return <main className="min-h-screen overflow-hidden bg-background">
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3" aria-label="Skyline Support home">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><LifeBuoy size={20} /></span>
        <span className="text-lg font-semibold tracking-tight text-foreground">Skyline Support</span>
      </Link>
      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary">Team dashboard <ArrowRight size={15} /></Link>
    </header>

    <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20 lg:px-12 lg:pb-24">
      <div className="flex flex-col justify-center">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"><span className="size-1.5 rounded-full bg-primary" /> Support that moves with you</div>
        <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">Let&apos;s get your issue <span className="text-primary">sorted.</span></h1>
        <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">Tell us what&apos;s happening and our team will get back to you with a clear next step. Every request is reviewed with care.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[['Fast response', 'Most replies within 2 hours', Clock3], ['Human support', 'Real people, thoughtful answers', MessageSquareText], ['Private by design', 'Your details stay protected', ShieldCheck]].map(([title, text, Icon]) => <div className="flex items-start gap-3" key={title as string}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-border"><Icon size={17} /></span><div><p className="text-sm font-semibold text-foreground">{title as string}</p><p className="mt-0.5 text-sm leading-5 text-muted-foreground">{text as string}</p></div></div>)}
        </div>
      </div>

      <div className="rounded-[2rem] border border-border bg-card p-5 shadow-[0_24px_80px_-32px_rgba(14,165,233,0.45)] sm:p-8">
        {state === 'success' ? <div className="flex min-h-[520px] flex-col items-center justify-center text-center"><span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><CheckCircle2 size={32} /></span><h2 className="mt-6 text-2xl font-semibold tracking-tight">Request received</h2><p className="mt-3 max-w-sm leading-6 text-muted-foreground">We&apos;ve sent your request to our support team. Keep this reference number for your records.</p><div className="mt-6 rounded-2xl bg-muted px-5 py-4 font-mono text-lg font-semibold tracking-wider text-primary">{reference}</div><button onClick={() => setState('idle')} className="mt-8 text-sm font-semibold text-primary hover:underline">Submit another request</button></div> : <form onSubmit={submit} className="space-y-5"><div><p className="text-sm font-semibold text-primary">New support request</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">How can we help?</h2></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Your name" name="requesterName" value={form.requesterName} onChange={(value) => setForm((current) => ({ ...current, requesterName: value }))} placeholder="Alex Morgan" /><Field label="Email address" name="requesterEmail" type="email" value={form.requesterEmail} onChange={(value) => setForm((current) => ({ ...current, requesterEmail: value }))} placeholder="alex@company.com" /></div><Field label="Subject" name="subject" value={form.subject} onChange={(value) => setForm((current) => ({ ...current, subject: value }))} placeholder="What do you need help with?" /><div className="grid gap-5 sm:grid-cols-2"><Select label="Category" value={form.category} options={['General', 'Account', 'Billing', 'Technical', 'Feedback']} onChange={(value) => setForm({ ...form, category: value })} /><Select label="Urgency" value={form.urgency} options={['Low', 'Normal', 'High', 'Critical']} onChange={(value) => setForm({ ...form, urgency: value })} /></div><div><label htmlFor="description" className="mb-2 block text-sm font-medium">Tell us more</label><textarea id="description" required minLength={10} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Share any details, steps, or context that could help us understand..." className="min-h-32 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div>{state === 'error' && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">We couldn&apos;t submit your request. Please check your connection and try again.</p>}<button disabled={state === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70">{state === 'sending' ? 'Sending request...' : 'Send support request'} {!state && <ArrowRight size={17} />}</button><p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><LockKeyhole size={13} /> Your information is safe with us.</p></form>}
      </div>
    </section>
    <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-border px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>© 2026 Skyline Support</span><span className="flex items-center gap-2"><Mail size={14} /> support@skyline.example</span></footer>
  </main>
}

function Field({ label, name, value, onChange, placeholder, type = 'text' }: { label: string; name: keyof typeof initialForm; value: string; placeholder: string; type?: string; onChange: (value: string) => void }) { return <div><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label><input id={name} name={name} type={type} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div> }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <div><label className="mb-2 block text-sm font-medium">{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">{options.map((option) => <option key={option}>{option}</option>)}</select></div> }
