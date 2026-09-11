'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Inbox,
  LifeBuoy,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'

type Ticket = {
  id: string
  reference_number: string
  requester_name: string
  requester_email: string
  subject: string
  description: string
  category: string
  urgency: string
  status: string
  ai_summary: string | null
  ai_sentiment: string | null
  ai_suggested_priority: string | null
  ai_next_steps: string[]
  created_at: string
}

const statusOptions = ['All', 'Open', 'In Progress', 'Resolved']

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  async function loadTickets() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tickets', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load tickets')
      const data = await response.json()
      setTickets(data.tickets ?? [])
    } catch {
      setError('We could not load the support queue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTickets() }, [])

  const visible = useMemo(() => tickets.filter((ticket) => {
    const matchesStatus = filter === 'All' || ticket.status === filter
    const searchText = `${ticket.subject} ${ticket.requester_name} ${ticket.reference_number} ${ticket.category}`.toLowerCase()
    return matchesStatus && searchText.includes(query.toLowerCase())
  }), [tickets, filter, query])

  async function updateStatus(status: string) {
    if (!selected) return
    setUpdating(true)
    try {
      const response = await fetch('/api/tickets', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, status }) })
      if (!response.ok) throw new Error('Unable to update ticket')
      const updated = { ...selected, status }
      setSelected(updated)
      setTickets((items) => items.map((item) => item.id === selected.id ? updated : item))
    } catch {
      setError('The ticket could not be updated. Please try again.')
    } finally { setUpdating(false) }
  }

  const counts = {
    open: tickets.filter((ticket) => ticket.status === 'Open').length,
    progress: tickets.filter((ticket) => ticket.status === 'In Progress').length,
    resolved: tickets.filter((ticket) => ticket.status === 'Resolved').length,
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><LifeBuoy size={18} /></span>
              <span className="font-semibold tracking-tight">Skyline Support</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-500" /> System operational</span>
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary"><ArrowLeft size={15} /> <span className="hidden sm:inline">Back to intake</span></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className={`${mobileNav ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-border bg-card lg:flex`}>
          <div className="flex items-center justify-between border-b border-border p-5 lg:hidden"><span className="font-semibold">Navigation</span><button onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={19} /></button></div>
          <nav className="space-y-1 p-4" aria-label="Dashboard navigation">
            <NavItem icon={Inbox} label="Inbox" active count={tickets.length} />
            <NavItem icon={BarChart3} label="Analytics" />
            <NavItem icon={FileText} label="Knowledge base" />
          </nav>
          <div className="mt-auto border-t border-border p-4"><div className="rounded-xl bg-muted p-4"><ShieldCheck className="text-primary" size={19} /><p className="mt-3 text-sm font-semibold">Privacy first</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Customer information is protected and only visible to your support team.</p></div></div>
        </aside>
        {mobileNav && <button className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" aria-label="Close navigation overlay" onClick={() => setMobileNav(false)} />}

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold text-primary">Support operations</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning, team</h1><p className="mt-2 text-sm text-muted-foreground">A clear view of every customer request, in one place.</p></div>
            <button onClick={loadTickets} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-border bg-card px-3 text-sm font-medium hover:border-primary hover:text-primary sm:self-auto"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh queue</button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric icon={Inbox} label="Open tickets" value={counts.open} detail="Needs attention" /><Metric icon={Clock3} label="In progress" value={counts.progress} detail="Being handled" /><Metric icon={CheckCircle2} label="Resolved" value={counts.resolved} detail="Closed successfully" /></div>

          <div className="mt-8 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Ticket queue</h2><p className="mt-1 text-xs text-muted-foreground">{visible.length} request{visible.length === 1 ? '' : 's'} matching your view</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} /><input aria-label="Search tickets" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or subject" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></div></div>
            <div className="flex gap-1 overflow-x-auto border-b border-border px-5 pt-3">{statusOptions.map((option) => <button key={option} onClick={() => setFilter(option)} className={`whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-medium ${filter === option ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{option}</button>)}</div>
            {error && <div className="mx-5 mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-4 font-medium">Request</th><th className="px-4 py-4 font-medium">Category</th><th className="px-4 py-4 font-medium">Priority</th><th className="px-4 py-4 font-medium">Status</th><th className="px-5 py-4" /></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground">Loading your support queue...</td></tr> : visible.length === 0 ? <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground">No tickets match this view.</td></tr> : visible.map((ticket) => <tr key={ticket.id} className="group cursor-pointer border-b border-border last:border-0 hover:bg-muted/50" onClick={() => setSelected(ticket)}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><UserRound size={16} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{ticket.subject}</p><p className="mt-1 text-xs text-muted-foreground">{ticket.reference_number} · {ticket.requester_name}</p></div></div></td><td className="px-4 py-4 text-sm text-muted-foreground">{ticket.category}</td><td className="px-4 py-4"><Priority value={ticket.ai_suggested_priority || ticket.urgency} /></td><td className="px-4 py-4"><Status status={ticket.status} /></td><td className="px-5 py-4 text-right"><ChevronRight size={17} className="ml-auto text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" /></td></tr>)}</tbody></table></div>
          </div>
        </section>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/25 p-0 sm:items-center sm:p-5" onClick={() => setSelected(null)}><article className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{selected.reference_number}</p><h2 className="mt-2 text-xl font-semibold tracking-tight">{selected.subject}</h2></div><button onClick={() => setSelected(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Close ticket details"><X size={18} /></button></div><div className="mt-6 grid gap-3 rounded-xl bg-muted p-4 text-sm"><p><span className="text-muted-foreground">From</span><br /><span className="font-medium">{selected.requester_name} · {selected.requester_email}</span></p><p><span className="text-muted-foreground">Category</span><br /><span className="font-medium">{selected.category} · {selected.urgency} urgency</span></p></div><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Customer message</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selected.description}</p></div>{selected.ai_summary && <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Support brief</p><p className="mt-2 text-sm leading-6">{selected.ai_summary}</p></div>}<div className="mt-7 flex flex-wrap gap-2">{statusOptions.slice(1).map((status) => <button key={status} disabled={updating} onClick={() => updateStatus(status)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${selected.status === status ? 'bg-primary text-primary-foreground' : 'border border-border hover:border-primary hover:text-primary'}`}>{status}</button>)}</div></article></div>}
    </main>
  )
}

function NavItem({ icon: Icon, label, active, count }: { icon: typeof Inbox; label: string; active?: boolean; count?: number }) { return <button className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={17} /><span>{label}</span>{count !== undefined && <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs ring-1 ring-border">{count}</span>}</button> }
function Metric({ icon: Icon, label, value, detail }: { icon: typeof Inbox; label: string; value: number; detail: string }) { return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={19} /></span></div><p className="mt-4 text-xs text-muted-foreground">{detail}</p></div> }
function Status({ status }: { status: string }) { return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-primary/10 text-primary'}`}>{status}</span> }
function Priority({ value }: { value: string }) { return <span className={`text-xs font-semibold ${value === 'Critical' || value === 'High' ? 'text-rose-600' : value === 'Low' ? 'text-muted-foreground' : 'text-amber-600'}`}>{value}</span> }
