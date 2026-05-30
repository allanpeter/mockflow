'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { markPayoutPaid } from '@/app/actions/mark-payout-paid'

interface Payout {
  id: string
  amount: number
  status: string
  release_at: string | null
  bookings: {
    id: string
    profiles: { full_name: string }
    sessions: { starts_at: string } | null
  }
  tutor_profiles: {
    cpf: string | null
    bank_code: string | null
    bank_agency: string | null
    bank_account: string | null
    bank_account_digit: string | null
    bank_account_type: string | null
    pix_key: string | null
    pix_key_type: string | null
    profiles: { full_name: string; avatar_url: string | null }
  }
}

export function PayoutRow({ payout }: Readonly<{ payout: Payout }>) {
  const [transferRef, setTransferRef] = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const tutor = payout.tutor_profiles
  const booking = payout.bookings
  const sessionDate = booking?.sessions?.starts_at
    ? new Date(booking.sessions.starts_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : '—'

  const pixInfo = tutor?.pix_key
    ? `${tutor.pix_key_type?.toUpperCase()}: ${tutor.pix_key}`
    : null

  const bankInfo = tutor?.bank_account
    ? `Banco ${tutor.bank_code} · Ag ${tutor.bank_agency} · CC ${tutor.bank_account}-${tutor.bank_account_digit}`
    : null

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  function handleMarkPaid() {
    startTransition(async () => {
      const { error } = await markPayoutPaid(payout.id, transferRef)
      if (error) {
        toast.error(error)
      } else {
        toast.success('Repasse marcado como pago.')
        setDone(true)
      }
    })
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-sm text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Marcado como pago
      </div>
    )
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">{tutor?.profiles?.full_name}</p>
          <p className="text-xs text-muted-foreground">
            Sessão com {booking?.profiles?.full_name} · {sessionDate}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold">
            {payout.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          {payout.status === 'failed' && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" /> Falhou antes
            </span>
          )}
        </div>
      </div>

      {/* Bank/PIX info */}
      <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs space-y-1">
        {tutor?.cpf && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">CPF</span>
            <button onClick={() => copy(tutor.cpf!)} className="flex items-center gap-1 font-mono hover:text-primary">
              {tutor.cpf} <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
        {bankInfo && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Conta</span>
            <button onClick={() => copy(bankInfo)} className="flex items-center gap-1 font-mono hover:text-primary">
              {bankInfo} <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
        {pixInfo && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">PIX</span>
            <button onClick={() => copy(tutor.pix_key!)} className="flex items-center gap-1 font-mono hover:text-primary">
              {pixInfo} <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
        {!bankInfo && !pixInfo && (
          <p className="text-amber-600">⚠ Tutor não cadastrou dados bancários</p>
        )}
      </div>

      {/* Mark as paid */}
      <div className="flex gap-2">
        <Input
          placeholder="Referência da transferência (opcional)"
          value={transferRef}
          onChange={(e) => setTransferRef(e.target.value)}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          onClick={handleMarkPaid}
          disabled={isPending || (!bankInfo && !pixInfo)}
        >
          {isPending ? 'Salvando…' : 'Marcar como pago'}
        </Button>
      </div>
    </div>
  )
}
