'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
}

function groupByDate(slots: Slot[]): Record<string, Slot[]> {
  const groups: Record<string, Slot[]> = {}
  for (const slot of slots) {
    const day = new Date(slot.starts_at).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
    if (!groups[day]) groups[day] = []
    groups[day].push(slot)
  }
  return groups
}

export function SlotPicker({ slots, tutorName, price, isLoggedIn, isLearner }: Readonly<Props>) {
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
              const time = new Date(slot.starts_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
              const selected = selectedSlotId === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:border-primary hover:text-primary'
                  }`}
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
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sessão com {tutorName}</span>
            <span>R$ {price.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa da plataforma (10%)</span>
            <span>R$ {(price * 0.1).toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>R$ {price.toFixed(2).replace('.', ',')}</span>
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
