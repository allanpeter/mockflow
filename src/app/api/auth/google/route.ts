import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

// Cookie carrying the role chosen on the signup screen across the Google OAuth
// round-trip. Supabase `queryParams` go to Google (which ignores them), so they
// never reach raw_user_meta_data — we persist the choice ourselves and apply it
// in /auth/callback after the session is established.
const PENDING_ROLE_COOKIE = 'mockflow_pending_role'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'
  const role = searchParams.get('role')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  if (role === 'tutor' || role === 'learner') {
    const cookieStore = await cookies()
    cookieStore.set(PENDING_ROLE_COOKIE, role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 min — enough to complete the OAuth round-trip
    })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback?next=${next}`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_failed`)
  }

  return NextResponse.redirect(data.url)
}
