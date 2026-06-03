import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CheckCircle2, Clock, AlertCircle, Wallet } from 'lucide-react'

export default async function GanhosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profile?.role !== 'tutor' && profile?.role !== 'admin') redirect('/dashboard')

  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('id, pagarme_recipient_id')
    .eq('user_id', user.id)
    .single<{ id: string; pagarme_recipient_id: string | null }>()

  if (!tutorProfile) redirect('/dashboard/profile')

  const admin = createAdminClient()

  const { data: payouts } = await admin
    .from('payouts')
    .select(`
      id, amount, status, release_at, paid_at, transfer_id,
      bookings (
        id,
        profiles!bookings_learner_id_fkey ( full_name ),
        sessions ( starts_at, ends_at )
      )
    `)
    .eq('tutor_id', tutorProfile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  type Payout = {
    id: string
    amount: number
    status: string
    release_at: string | null
    paid_at: string | null
    transfer_id: string | null
    bookings: {
      id: string
      profiles: { full_name: string }
      sessions: { starts_at: string; ends_at: string } | null
    }
  }

  const rows = (payouts ?? []) as unknown as Payout[]
  const pending = rows.filter((p) => p.status === 'pending' || p.status === 'processing')
  const paid = rows.filter((p) => p.status === 'paid')
  const failed = rows.filter((p) => p.status === 'failed')

  const pendingTotal = pending.reduce((sum, p) => sum + p.amount, 0)

  function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Dashboard</p>
        <h1 className="text-2xl font-bold">Ganhos</h1>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Os repasses são realizados todo final de mês via transferência bancária. Certifique-se de que seus dados bancários estão atualizados no{' '}
        <a href="/dashboard/profile" className="underline underline-offset-2 text-foreground">perfil</a>.
      </div>

      {!tutorProfile.pagarme_recipient_id && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Cadastre seus dados bancários no{' '}
            <a href="/dashboard/profile" className="underline underline-offset-2">perfil</a>{' '}
            para receber seus repasses automaticamente.
          </p>
        </div>
      )}

      {/* Summary card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">A receber</p>
            <p className="text-2xl font-bold">{formatBRL(pendingTotal)}</p>
          </div>
        </div>
      </div>

      {/* Pending payouts */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">A receber</h2>
          <div className="divide-y rounded-xl border">
            {pending.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between px-4 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Sessão com {payout.bookings?.profiles?.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payout.bookings?.sessions
                      ? formatDate(payout.bookings.sessions.starts_at)
                      : '—'}
                    {payout.release_at && (
                      <> · Repasse previsto: {formatDate(payout.release_at)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatBRL(payout.amount)}</span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    <Clock className="h-3 w-3" />
                    {payout.status === 'processing' ? 'Processando' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Failed payouts */}
      {failed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Com problema</h2>
          <div className="divide-y rounded-xl border border-destructive/20">
            {failed.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between px-4 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Sessão com {payout.bookings?.profiles?.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payout.bookings?.sessions ? formatDate(payout.bookings.sessions.starts_at) : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatBRL(payout.amount)}</span>
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    <AlertCircle className="h-3 w-3" />
                    Falhou
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Verifique seus dados bancários no{' '}
            <a href="/dashboard/profile" className="underline underline-offset-2">perfil</a>.
          </p>
        </section>
      )}

      {/* Paid payouts */}
      {paid.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Histórico</h2>
          <div className="divide-y rounded-xl border">
            {paid.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between px-4 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Sessão com {payout.bookings?.profiles?.full_name ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pago em {formatDate(payout.paid_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatBRL(payout.amount)}</span>
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Pago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhum repasse ainda. Seus ganhos aparecerão aqui após cada sessão confirmada.
        </p>
      )}
    </div>
  )
}
