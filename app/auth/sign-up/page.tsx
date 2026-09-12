'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LifeBuoy, Loader2 } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.password.length < 8 || form.password !== form.confirm) { toast.error('Use matching passwords with at least 8 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Check your email to confirm your agent account.')
    router.push('/auth/login')
  }
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-10"><Toaster position="top-center" /><div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8"><Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><LifeBuoy size={20} /></span><span className="font-semibold">Skyline Support</span></Link><div className="mt-10"><p className="text-sm font-semibold text-primary">Agent workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your account</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Create an account for your support team inbox.</p></div><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-medium">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label><label className="block text-sm font-medium">Password<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label><label className="block text-sm font-medium">Confirm password<input required type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label><button disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{loading && <Loader2 size={17} className="animate-spin" />} Create account</button></form><p className="mt-6 text-center text-sm text-muted-foreground">Already registered? <Link href="/auth/login" className="font-semibold text-primary hover:underline">Sign in</Link></p></div></main>
}
