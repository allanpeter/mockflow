'use client'

import { useState, useTransition } from 'react'
import { AlertDialog } from '@base-ui/react'
import { Button } from '@/components/ui/button'
import { reportNoShow } from '@/app/actions/report-no-show'
import { UserX } from 'lucide-react'

interface Props {
  bookingId: string
}

export function NoShowButton({ bookingId }: Readonly<Props>) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleReport() {
    setError(null)
    startTransition(async () => {
      const result = await reportNoShow(bookingId)
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
            <UserX className="h-3 w-3" />
            Entrevistador não apareceu
          </button>
        }
      />

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg space-y-4">
          <AlertDialog.Title className="text-lg font-semibold">
            Reportar ausência do entrevistador?
          </AlertDialog.Title>

          <AlertDialog.Description className="text-sm text-muted-foreground">
            Ao confirmar, você receberá reembolso integral em até 5 dias úteis. Esta ação não pode ser desfeita.
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
              onClick={handleReport}
            >
              {isPending ? 'Enviando…' : 'Confirmar reporte'}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
