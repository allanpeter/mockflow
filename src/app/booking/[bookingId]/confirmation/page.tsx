import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, Clock, Video, Loader2 } from 'lucide-react'

interface Props {
  params: Promise<Readonly<{ bookingId: string }>>
}

export default async function ConfirmationPage({ params }: Readonly<Props>) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, status, gross_amount,
      tutor_profiles (
        profiles ( full_name )
      ),
      sessions ( id, starts_at, ends_at, whereby_room_url )
    `)
    .eq('id', bookingId)
    .eq('learner_id', user.id)
    .single()

  // Unknown booking or cancelled
  if (!booking || booking.status === 'cancelled') redirect('/tutors')

  const tutor = booking.tutor_profiles as unknown as { profiles: { full_name: string } }

  // Payment still processing — webhook hasn't fired yet
  if (booking.status === 'pending_payment') {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <h1 className="text-2xl font-bold">Processando pagamento…</h1>
          <p className="text-muted-foreground">
            Aguarde enquanto confirmamos seu pagamento. Esta página atualiza automaticamente.
          </p>
        </div>
        {/* Auto-refresh every 3s until confirmed */}
        <meta httpEquiv="refresh" content="3" />
        <Button variant="outline" render={<Link href="/agenda" />}>
          Ver minha agenda
        </Button>
      </div>
    )
  }

  const session = booking.sessions as unknown as {
    id: string
    starts_at: string
    ends_at: string
    whereby_room_url: string | null
  } | null

  const sessionDate = session
    ? new Date(session.starts_at).toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : null

  const sessionTime = session
    ? new Date(session.starts_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Sessão confirmada!</h1>
        <p className="text-muted-foreground">
          Seu pagamento foi processado. Veja os detalhes abaixo.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 text-left space-y-4">
        <h2 className="font-semibold">Detalhes da sessão</h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground">Entrevistador</p>
              <p className="font-medium">{tutor?.profiles?.full_name ?? '—'}</p>
            </div>
          </div>

          {sessionDate && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium capitalize">{sessionDate}</p>
              </div>
            </div>
          )}

          {sessionTime && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground">Horário</p>
                <p className="font-medium">{sessionTime} (60 min)</p>
              </div>
            </div>
          )}
        </div>

        {session?.whereby_room_url ? (
          <Button className="w-full mt-2" nativeButton={false} render={<a href={session.whereby_room_url} target="_blank" rel="noopener noreferrer" aria-label="Entrar na sessão" />}>
            <Video className="mr-2 h-4 w-4" />
            Entrar na sessão
          </Button>
        ) : (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            O link da videochamada será enviado por e-mail e aparecerá aqui antes da sessão.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Ir para o Dashboard
        </Button>
        <Button variant="ghost" render={<Link href="/tutors" />}>
          Ver outros entrevistadores
        </Button>
      </div>
    </div>
  )
}
