'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Log out after 30 minutes of inactivity
const IDLE_MS = 30 * 60 * 1000

const EVENTS = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart']

export function IdleTimeout() {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function logout() {
      await supabase.auth.signOut()
      toast.info('Você foi desconectado por inatividade.')
      router.push('/auth/login')
    }

    function reset() {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(logout, IDLE_MS)
    }

    // Only activate if there's an active session
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return

      reset()
      EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    })

    return () => {
      if (timer.current) clearTimeout(timer.current)
      EVENTS.forEach(e => window.removeEventListener(e, reset))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
