'use client'

import { useState, useTransition } from 'react'
import { AlertDialog } from '@base-ui/react'
import { Button } from '@/components/ui/button'
import { cancelBooking } from '@/app/actions/cancel-booking'
import { X } from 'lucide-react'

interface Props {
  bookingId: string
  hoursUntilSession: number
}

export function CancelButton({ bookingId, hoursUntilSession }: Readonly<Props>) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const refundEligible = hoursUntilSession > 24

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelBooking(bookingId)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        render={
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3 w-3" />
            Cancelar
          </button>
        }
      />

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg space-y-4">
          <AlertDialog.Title className="text-lg font-semibold">
            Cancelar sessão?
          </AlertDialog.Title>

          <AlertDialog.Description className="text-sm text-muted-foreground">
            {refundEligible
              ? 'Como o cancelamento é feito com mais de 24h de antecedência, você receberá o reembolso integral em até 5 dias úteis.'
              : 'O cancelamento é feito com menos de 24h de antecedência. Conforme nossa política, não há reembolso neste caso.'}
          </AlertDialog.Description>

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isPending}
              onClick={handleCancel}
            >
              {isPending ? 'Cancelando…' : 'Confirmar cancelamento'}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
