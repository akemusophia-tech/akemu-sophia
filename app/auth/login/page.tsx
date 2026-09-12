'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LifeBuoy, Loader2 } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message.includes('Email not confirmed') ? 'Confirm your email before signing in.' : 'Invalid email or password.')
      setLoading(false)
      return
    }
    toast.success('Welcome back')
    router.push('/dashboard')
  }

  return <main className="grid min-h-screen place-items-center bg-background px-5 py-10"><Toaster position="top-center" /><div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8"><Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><LifeBuoy size={20} /></span><span className="font-semibold">Skyline Support</span></Link><div className="mt-10"><p className="text-sm font-semibold text-primary">Agent workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to your inbox</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Access live tickets, Gemini suggestions, and status updates.</p></div><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label><label className="block text-sm font-medium">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label><button disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{loading && <Loader2 size={17} className="animate-spin" />} Sign in</button></form><p className="mt-6 text-center text-sm text-muted-foreground">Need an agent account? <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">Create one</Link></p></div></main>
}
