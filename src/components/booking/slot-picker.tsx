'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDatePtBr, formatTimePtBr } from '@/lib/date'
import { initiateBooking } from '@/app/actions/booking'

interface Slot {
  id: string
  starts_at: string
  ends_at: string
}

interface Props {
  slots: Slot[]
  tutorName: string
  price: number
  isLoggedIn: boolean
  isLearner: boolean
  isFree?: boolean
}

function groupByDate(slots: Slot[]): Record<string, Slot[]> {
  const groups: Record<string, Slot[]> = {}
  for (const slot of slots) {
    const day = formatDatePtBr(slot.starts_at, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
    if (!groups[day]) groups[day] = []
    groups[day].push(slot)
  }
  return groups
}

export function SlotPicker({ slots, tutorName, price, isLoggedIn, isLearner, isFree = false }: Readonly<Props>) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!slots.length) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Nenhum horário disponível nas próximas 4 semanas.
      </p>
    )
  }

  const grouped = groupByDate(slots)

  function handleBook() {
    if (!isLoggedIn) {
      router.push('/auth/login?redirectedFrom=' + globalThis.location.pathname)
      return
    }
    if (!isLearner) {
      toast.error('Apenas candidatos podem agendar sessões.')
      return
    }
    if (!selectedSlotId) {
      toast.error('Selecione um horário primeiro.')
      return
    }

    startTransition(async () => {
      const result = await initiateBooking(selectedSlotId)
      if (result?.error) toast.error(result.error)
      // on success the action redirects automatically
    })
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, daySlots]) => (
        <div key={day}>
          <p className="mb-2 text-sm font-medium capitalize">{day}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const time = formatTimePtBr(slot.starts_at)
              const selected = selectedSlotId === slot.id
              const hoursUntil = (new Date(slot.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)
              const tooSoon = hoursUntil < 3
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={tooSoon}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    tooSoon
                      ? 'border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      : selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:border-primary hover:text-primary'
                  }`}
                  title={tooSoon ? 'Mínimo 3 horas de antecedência' : undefined}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Checkout summary */}
      {selectedSlotId && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sessão com {tutorName}</span>
            <span className="font-semibold">
              {isFree ? 'Grátis' : `R$ ${price.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
        </div>
      )}

      <Button
        className="w-full sm:w-auto"
        disabled={!selectedSlotId || isPending}
        onClick={handleBook}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoggedIn
          ? 'Entrar para agendar'
          : isPending
          ? 'Processando…'
          : isFree
          ? 'Confirmar (grátis)'
          : 'Confirmar e pagar'}
      </Button>

      {!isLoggedIn && (
        <p className="text-xs text-muted-foreground">
          Você precisa estar logado como candidato para agendar.
        </p>
      )}
    </div>
  )
}
