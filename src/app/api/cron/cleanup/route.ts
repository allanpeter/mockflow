import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Cleanup abandoned pending_payment bookings
// This endpoint is called hourly by a cron job to clean up bookings
// where the user started checkout but never completed payment.
export async function GET(request: Request) {
  // Verify cron secret if using Vercel
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()

    // Call the cleanup function to cancel abandoned bookings older than 30 minutes
    const { data, error } = await admin.rpc('cleanup_abandoned_bookings', {
      p_minutes_old: 30,
    })

    if (error) {
      console.error('[cron/cleanup] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[cron/cleanup] Cleaned up ${data} abandoned bookings`)

    return NextResponse.json({ success: true, cleaned: data })
  } catch (err) {
    console.error('[cron/cleanup] Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
