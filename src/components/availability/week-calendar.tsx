'use client'

import { useState, useTransition, useCallback } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { createSlot, deleteSlot } from '@/app/actions/availability'
import { Button } from '@/components/ui/button'

// Hours shown in the grid (08:00 – 22:00)
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DAYS_FULL  = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

interface Slot {
  id: string
  starts_at: string
  is_booked: boolean
}

interface Props {
  initialSlots: Slot[]
  tutorTimezone?: string // future use
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function WeekCalendar({ initialSlots }: Readonly<Props>) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Build a lookup: "YYYY-MM-DD HH" → slot
  const slotMap = new Map<string, Slot>()
  for (const s of slots) {
    const d = new Date(s.starts_at)
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const key = `${localDate} ${String(d.getHours()).padStart(2, '0')}`
    slotMap.set(key, s)
  }

  function cellKey(day: Date, hour: number) {
    return `${isoDay(day)} ${String(hour).padStart(2, '0')}`
  }

  function isPast(day: Date, hour: number) {
    const dt = new Date(day)
    dt.setHours(hour, 0, 0, 0)
    return dt < new Date()
  }

  const handleCellClick = useCallback((day: Date, hour: number) => {
    const key = cellKey(day, hour)
    if (isPast(day, hour)) return

    const existing = slotMap.get(key)

    if (existing) {
      if (existing.is_booked) {
        toast.error('Este slot já está reservado.')
        return
      }
      // Optimistic remove
      setPendingKey(key)
      setSlots((prev) => prev.filter((s) => s.id !== existing.id))

      startTransition(async () => {
        const result = await deleteSlot(existing.id)
        if (result.error) {
          toast.error(result.error)
          setSlots((prev) => [...prev, existing]) // rollback
        }
        setPendingKey(null)
      })
    } else {
      // Optimistic add
      const dt = new Date(day)
      dt.setHours(hour, 0, 0, 0)
      const tempSlot: Slot = {
        id: `temp-${key}`,
        starts_at: dt.toISOString(),
        is_booked: false,
      }
      setPendingKey(key)
      setSlots((prev) => [...prev, tempSlot])

      startTransition(async () => {
        const result = await createSlot(dt.toISOString())
        if (result.error) {
          toast.error(result.error)
          setSlots((prev) => prev.filter((s) => s.id !== tempSlot.id)) // rollback
        }
        // server revalidates and next navigation will get real ID
        setPendingKey(null)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots])

  const prevWeek = () => setWeekStart((w) => addDays(w, -7))
  const nextWeek = () => setWeekStart((w) => addDays(w, 7))
  const goToday  = () => setWeekStart(startOfWeek(new Date()))

  const weekLabel = `${days[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${days[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={prevWeek} aria-label="Semana anterior">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={nextWeek} aria-label="Próxima semana">
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="hidden sm:inline-flex">
            Hoje
          </Button>
        </div>
        <p className="text-sm font-medium">{weekLabel}</p>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Toque para adicionar / remover
        </p>
      </div>

      {/* Grid — scrollable on mobile */}
      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[600px]">
          {/* Day headers */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b bg-muted/40">
            <div /> {/* time column spacer */}
            {days.map((day, i) => {
              const isToday = isoDay(day) === isoDay(new Date())
              return (
                <div key={i} className="py-2 text-center">
                  <p className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {DAYS_SHORT[day.getDay()]}
                  </p>
                  <p className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                    {day.getDate()}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Time rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] border-b last:border-0">
              {/* Hour label */}
              <div className="flex items-center justify-center py-1 text-xs text-muted-foreground">
                {String(hour).padStart(2, '0')}:00
              </div>

              {days.map((day, di) => {
                const key = cellKey(day, hour)
                const slot = slotMap.get(key)
                const past = isPast(day, hour)
                const loading = pendingKey === key

                let bg = 'hover:bg-muted/60 cursor-pointer'
                if (past) bg = 'bg-muted/20 cursor-not-allowed opacity-40'
                else if (slot?.is_booked) bg = 'bg-amber-100 dark:bg-amber-900/30 cursor-not-allowed'
                else if (slot) bg = 'bg-primary/15 hover:bg-primary/25 cursor-pointer'

                return (
                  <button
                    key={di}
                    type="button"
                    disabled={past || loading}
                    onClick={() => handleCellClick(day, hour)}
                    aria-label={`${DAYS_FULL[day.getDay()]} ${String(hour).padStart(2,'0')}:00 ${slot ? (slot.is_booked ? '(reservado)' : '(disponível)') : '(livre)'}`}
                    className={`relative border-l py-3 text-center text-xs transition-colors ${bg}`}
                  >
                    {loading && (
                      <Loader2 className="mx-auto h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                    {!loading && slot?.is_booked && (
                      <span className="font-medium text-amber-700 dark:text-amber-400">Reservado</span>
                    )}
                    {!loading && slot && !slot.is_booked && (
                      <span className="font-medium text-primary">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border" />
          Disponível para adicionar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary/20" />
          Seu slot disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-200 dark:bg-amber-900/50" />
          Já reservado
        </span>
      </div>
    </div>
  )
}
