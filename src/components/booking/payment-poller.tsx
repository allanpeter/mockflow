'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkPayment } from '@/app/actions/check-payment'

interface Props {
  bookingId: string
}

const INTERVAL_MS = 4000

export function PaymentPoller({ bookingId }: Readonly<Props>) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  useEffect(() => {
    let stopped = false

    async function poll() {
      if (stopped) return
      const { confirmed } = await checkPayment(bookingId)
      if (confirmed) {
        router.refresh()
        return
      }
      if (!stopped) setTimeout(poll, INTERVAL_MS)
    }

    const timer = setTimeout(poll, INTERVAL_MS)
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [bookingId, router, startTransition])

  return null
}
