import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles both email confirmation links and OAuth redirects
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // After OAuth signup the profile trigger fires but role may be missing
      // (Google OAuth doesn't prompt for role). Redirect to role-select if needed.
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single<{ role: string | null }>()

        if (!profile?.role) {
          return NextResponse.redirect(`${origin}/auth/select-role`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
