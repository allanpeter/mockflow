import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  return profile?.role === 'admin' ? user : null
}

// GET /api/admin/users — list all users
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch profiles for role info
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, full_name, role, created_at')

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    full_name: profileMap[u.id]?.full_name ?? null,
    role: profileMap[u.id]?.role ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }))

  return NextResponse.json({ users })
}

// DELETE /api/admin/users?id=uuid — delete a user via admin API (correct order)
export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')
  if (!userId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Prevent self-deletion
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Não é possível deletar sua própria conta.' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Use a security-definer DB function to delete in the correct order:
  // public.profiles first (cascades bookings/sessions/reviews) → then auth.users
  const { error } = await adminClient.rpc('delete_user_by_id', { target_user_id: userId })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
