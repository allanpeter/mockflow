'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleTutorActive } from '@/app/actions/tutor-profile'

interface Props {
  isActive: boolean
}

export function ActiveToggle({ isActive }: Readonly<Props>) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      const result = await toggleTutorActive(!isActive)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          !isActive ? 'Você está disponível para entrevistas!' : 'Perfil pausado.'
        )
      }
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-medium">
          {isActive ? '🟢 Disponível' : '⏸️ Pausado'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isActive
            ? 'Seu perfil aparece nas buscas e aceita agendamentos'
            : 'Seu perfil está oculto — nenhum novo agendamento'}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={isPending}
        onClick={toggle}
        className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
          isActive ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            isActive ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
