'use client'

import Link from 'next/link'
import { BarChart3, BookOpen, Inbox, LifeBuoy, Menu, Settings, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'

const items = [
  { href: '/dashboard', label: 'Inbox', icon: Inbox },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/knowledge-base', label: 'Knowledge base', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function SupportShell({ children, active = 'Inbox' }: { children: React.ReactNode; active?: string }) {
  const [open, setOpen] = useState(false)
  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3"><button className="grid size-11 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button><Link href="/" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><LifeBuoy size={18} /></span><span className="font-semibold tracking-tight">Skyline Support</span></Link></div>
        <div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-500" /> All systems operational</span><span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">AM</span></div>
      </div>
    </header>
    <div className="mx-auto flex max-w-[1500px]">
      {open && <button className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:translate-x-0`}>
        <div className="flex items-center justify-between border-b border-border p-5 lg:hidden"><span className="font-semibold">Workspace</span><button className="grid size-11 place-items-center rounded-xl hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
        <div className="p-4"><p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Workspace</p>{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${active === label ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={18} /><span>{label}</span>{label === 'Inbox' && <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">Live</span>}</Link>)}</div>
        <div className="mt-auto p-4"><div className="rounded-2xl bg-muted p-4"><ShieldCheck className="text-primary" size={19} /><p className="mt-3 text-sm font-semibold">Privacy first</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Customer information is protected and visible only to your team.</p></div><p className="mt-4 px-2 text-xs text-muted-foreground">Skyline workspace · Pro plan</p></div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  </div>
}

export function StatusPill({ status }: { status: string }) { return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-primary/10 text-primary'}`}>{status}</span> }
export function PriorityPill({ value }: { value: string }) { return <span className={`text-xs font-bold ${value === 'Critical' || value === 'High' ? 'text-rose-600' : value === 'Low' ? 'text-muted-foreground' : 'text-amber-600'}`}>{value}</span> }
export function EmptyState({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"><p className="font-semibold">{title}</p><p className="mt-2 text-sm text-muted-foreground">{text}</p></div> }
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-primary">{eyebrow}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</div> }
