import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').select('id').limit(1)

  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 503 })
  }

  return NextResponse.json({ status: 'ok' })
}
