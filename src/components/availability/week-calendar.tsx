'use client'

import { useState, useTransition, useCallback, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createSlot, deleteSlot } from '@/app/actions/availability'
import { Button } from '@/components/ui/button'
import { formatDatePtBr } from '@/lib/date'

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
  tutorTimezone?: string
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function cellKey(day: Date, hour: number): string {
  return `${isoDay(day)} ${String(hour).padStart(2, '0')}`
}

function keyToDate(key: string): Date {
  const [dateStr, hourStr] = key.split(' ')
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, Number(hourStr), 0, 0, 0)
}

function isPast(day: Date, hour: number): boolean {
  const dt = new Date(day)
  dt.setHours(hour, 0, 0, 0)
  return dt < new Date()
}

export function WeekCalendar({ initialSlots }: Readonly<Props>) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [, startTransition] = useTransition()
  const [dragHighlight, setDragHighlight] = useState<Set<string>>(new Set())

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const slotMap = useMemo(() => {
    const map = new Map<string, Slot>()
    for (const s of slots) {
      const d = new Date(s.starts_at)
      map.set(cellKey(d, d.getHours()), s)
    }
    return map
  }, [slots])

  // Refs so stable callbacks always read the latest values
  const slotMapRef = useRef(slotMap)
  slotMapRef.current = slotMap
  const daysRef = useRef(days)
  daysRef.current = days

  // Drag state in refs (no re-render needed mid-drag)
  const isDraggingRef  = useRef(false)
  const dragActionRef  = useRef<'add' | 'remove' | null>(null)
  const dragKeysRef    = useRef<Set<string>>(new Set())

  // commitDrag via ref so global mouseup always has the freshest closure
  const commitDragRef = useRef<(keys: Set<string>, action: 'add' | 'remove') => void>(() => {})
  commitDragRef.current = (keys, action) => {
    const map = slotMapRef.current
    if (action === 'add') {
      const now = new Date()
      const newSlots: Slot[] = []
      for (const key of keys) {
        if (map.has(key)) continue
        const dt = keyToDate(key)
        if (dt < now) continue
        newSlots.push({ id: `temp-${key}`, starts_at: dt.toISOString(), is_booked: false })
      }
      if (newSlots.length === 0) return
      setSlots(prev => [...prev, ...newSlots])
      startTransition(async () => {
        const results = await Promise.all(newSlots.map(s => createSlot(s.starts_at)))
        const failed  = newSlots.filter((_, i) => results[i].error)
        if (failed.length > 0) {
          toast.error(`${failed.length} horário(s) não puderam ser criados.`)
          setSlots(prev => prev.filter(s => !failed.some(f => f.id === s.id)))
        }
      })
    } else {
      const toRemove = [...keys]
        .map(k => map.get(k))
        .filter((s): s is Slot => !!s && !s.is_booked)
      if (toRemove.length === 0) return
      setSlots(prev => prev.filter(s => !toRemove.some(r => r.id === s.id)))
      startTransition(async () => {
        const results = await Promise.all(toRemove.map(s => deleteSlot(s.id)))
        const failed  = toRemove.filter((_, i) => results[i].error)
        if (failed.length > 0) {
          toast.error(`${failed.length} horário(s) não puderam ser removidos.`)
          setSlots(prev => [...prev, ...failed])
        }
      })
    }
  }

  // Commit drag on mouseup anywhere in the window
  useEffect(() => {
    const onMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      const keys   = new Set(dragKeysRef.current)
      const action = dragActionRef.current
      dragKeysRef.current   = new Set()
      dragActionRef.current = null
      setDragHighlight(new Set())
      if (action && keys.size > 0) commitDragRef.current(keys, action)
    }
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [])

  const handleCellMouseDown = useCallback((day: Date, hour: number) => {
    const key = cellKey(day, hour)
    if (isPast(day, hour)) return
    const existing = slotMapRef.current.get(key)
    if (existing?.is_booked) { toast.error('Este slot já está reservado.'); return }
    isDraggingRef.current  = true
    dragActionRef.current  = existing ? 'remove' : 'add'
    dragKeysRef.current    = new Set([key])
    setDragHighlight(new Set([key]))
  }, [])

  const handleCellMouseEnter = useCallback((day: Date, hour: number) => {
    if (!isDraggingRef.current) return
    const key = cellKey(day, hour)
    if (isPast(day, hour)) return
    dragKeysRef.current.add(key)
    setDragHighlight(new Set(dragKeysRef.current))
  }, [])

  // Touch: single-cell toggle (no drag on mobile)
  const handleCellTouchEnd = useCallback((day: Date, hour: number) => {
    if (isPast(day, hour)) return
    const key = cellKey(day, hour)
    const existing = slotMapRef.current.get(key)
    if (existing?.is_booked) { toast.error('Este slot já está reservado.'); return }
    commitDragRef.current(new Set([key]), existing ? 'remove' : 'add')
  }, [])

  // Quick-fill: all future hours for a given day
  const handleDayFill = useCallback((day: Date) => {
    const map   = slotMapRef.current
    const future = HOURS.filter(h => !isPast(day, h))
    const free   = future.filter(h => !map.has(cellKey(day, h)))
    const filled = future.filter(h => { const s = map.get(cellKey(day, h)); return s && !s.is_booked })
    if (free.length > 0)   commitDragRef.current(new Set(free.map(h => cellKey(day, h))), 'add')
    else if (filled.length > 0) commitDragRef.current(new Set(filled.map(h => cellKey(day, h))), 'remove')
  }, [])

  // Quick-fill: a given hour across all visible days
  const handleHourFill = useCallback((hour: number) => {
    const map    = slotMapRef.current
    const ds     = daysRef.current
    const future = ds.filter(d => !isPast(d, hour))
    const free   = future.filter(d => !map.has(cellKey(d, hour)))
    const filled = future.filter(d => { const s = map.get(cellKey(d, hour)); return s && !s.is_booked })
    if (free.length > 0)   commitDragRef.current(new Set(free.map(d => cellKey(d, hour))), 'add')
    else if (filled.length > 0) commitDragRef.current(new Set(filled.map(d => cellKey(d, hour))), 'remove')
  }, [])

  const prevWeek = () => setWeekStart(w => addDays(w, -7))
  const nextWeek = () => setWeekStart(w => addDays(w, 7))
  const goToday  = () => setWeekStart(startOfWeek(new Date()))

  const weekLabel = `${formatDatePtBr(days[0].toISOString(), { day: '2-digit', month: 'short' })} – ${formatDatePtBr(days[6].toISOString(), { day: '2-digit', month: 'short', year: 'numeric' })}`

  return (
    <div className="space-y-4 select-none" onDragStart={e => e.preventDefault()}>
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
          Clique ou arraste para marcar
        </p>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border">
        <div className="min-w-[600px]">
          {/* Day headers — click to fill/clear entire column */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b bg-muted/40">
            <div />
            {days.map((day, i) => {
              const isToday = isoDay(day) === isoDay(new Date())
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayFill(day)}
                  title="Preencher / limpar dia"
                  className={`w-full py-2 text-center transition-colors hover:bg-muted ${isToday ? 'text-primary' : ''}`}
                >
                  <p className="text-xs font-medium">{DAYS_SHORT[day.getDay()]}</p>
                  <p className="text-sm font-semibold">{day.getDate()}</p>
                </button>
              )
            })}
          </div>

          {/* Time rows */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] border-b last:border-0">
              {/* Hour label — click to fill/clear entire row */}
              <button
                type="button"
                onClick={() => handleHourFill(hour)}
                title="Preencher / limpar esta hora"
                className="flex items-center justify-center py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {String(hour).padStart(2, '0')}:00
              </button>

              {days.map((day, di) => {
                const key       = cellKey(day, hour)
                const slot      = slotMap.get(key)
                const past      = isPast(day, hour)
                const inDrag    = dragHighlight.has(key)
                const addDrag   = inDrag && dragActionRef.current === 'add'
                const rmDrag    = inDrag && dragActionRef.current === 'remove'

                let cls = 'relative border-l h-11 text-center text-xs transition-colors'
                if (past)             cls += ' bg-muted/20 cursor-not-allowed opacity-40'
                else if (slot?.is_booked) cls += ' bg-amber-100 dark:bg-amber-900/30 cursor-not-allowed'
                else if (addDrag)     cls += ' bg-primary/40 cursor-pointer'
                else if (rmDrag)      cls += ' bg-destructive/20 cursor-pointer'
                else if (slot)        cls += ' bg-primary/15 hover:bg-primary/25 cursor-pointer'
                else                  cls += ' hover:bg-muted/60 cursor-pointer'

                return (
                  <button
                    key={di}
                    type="button"
                    disabled={past}
                    onMouseDown={() => handleCellMouseDown(day, hour)}
                    onMouseEnter={() => handleCellMouseEnter(day, hour)}
                    onTouchEnd={e => { e.preventDefault(); handleCellTouchEnd(day, hour) }}
                    aria-label={`${DAYS_FULL[day.getDay()]} ${String(hour).padStart(2, '0')}:00 ${slot ? (slot.is_booked ? '(reservado)' : '(disponível)') : '(livre)'}`}
                    className={cls}
                  >
                    {!past && slot?.is_booked && (
                      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                        Reservado
                      </span>
                    )}
                    {!past && slot && !slot.is_booked && !inDrag && (
                      <span className="text-sm font-semibold text-primary">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border" />
          Livre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary/20" />
          Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-200 dark:bg-amber-900/50" />
          Reservado
        </span>
        <span className="hidden sm:inline ml-2">· Clique no dia ou na hora para preencher tudo de uma vez</span>
      </div>
    </div>
  )
}
