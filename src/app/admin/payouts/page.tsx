import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PayoutRow } from '@/components/admin/payout-row'
import { formatDatePtBr } from '@/lib/date'

export default async function AdminPayoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = createAdminClient()

  const { data: pending } = await admin
    .from('payouts')
    .select(`
      id, amount, status, release_at, paid_at, created_at,
      bookings (
        id,
        profiles!bookings_learner_id_fkey ( full_name ),
        sessions ( starts_at )
      ),
      tutor_profiles (
        cpf, bank_code, bank_agency, bank_account, bank_account_digit, bank_account_type,
        pix_key, pix_key_type,
        profiles ( full_name, avatar_url )
      )
    `)
    .in('status', ['pending', 'failed'])
    .order('release_at', { ascending: true })

  const { data: recentPaid } = await admin
    .from('payouts')
    .select(`
      id, amount, status, paid_at, transfer_id,
      bookings (
        profiles!bookings_learner_id_fkey ( full_name ),
        sessions ( starts_at )
      ),
      tutor_profiles (
        profiles ( full_name )
      )
    `)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(30)

  const pendingTotal = (pending ?? []).reduce((sum, p) => sum + p.amount, 0)

  function formatBRL(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatDate(iso: string | null, includeTime = false) {
    if (!iso) return '—'
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
    if (includeTime) { opts.hour = '2-digit'; opts.minute = '2-digit' }
    return formatDatePtBr(iso, opts)
  }

  type PendingPayout = typeof pending extends (infer T)[] | null ? T : never
  type PaidPayout = typeof recentPaid extends (infer T)[] | null ? T : never

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin</p>
          <h1 className="text-2xl font-bold">Repasses</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total a pagar</p>
          <p className="text-xl font-bold text-primary">{formatBRL(pendingTotal)}</p>
        </div>
      </div>

      {/* Pending */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          A pagar ({(pending ?? []).length})
        </h2>

        {(pending ?? []).length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhum repasse pendente.
          </p>
        ) : (
          <div className="divide-y rounded-xl border">
            {(pending as PendingPayout[]).map((payout) => (
              <PayoutRow key={payout.id} payout={payout as never} />
            ))}
          </div>
        )}
      </section>

      {/* Paid history */}
      {(recentPaid ?? []).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Histórico recente
          </h2>
          <div className="divide-y rounded-xl border">
            {(recentPaid as PaidPayout[]).map((payout) => {
              const tutor = payout.tutor_profiles as unknown as { profiles: { full_name: string } }
              const booking = payout.bookings as unknown as {
                profiles: { full_name: string }
                sessions: { starts_at: string } | null
              }
              return (
                <div key={payout.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{tutor?.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Sessão com {booking?.profiles?.full_name} · {formatDate(booking?.sessions?.starts_at ?? null, true)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatBRL(payout.amount)}</p>
                    <p className="text-xs text-muted-foreground">Pago em {formatDate(payout.paid_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
