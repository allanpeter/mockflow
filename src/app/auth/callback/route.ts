import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles both email confirmation links and OAuth redirects
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Use the configured app URL to avoid resolving to the internal container address
  // when running behind a reverse proxy on Coolify.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single<{ role: string | null }>()

        if (!profile?.role) {
          return NextResponse.redirect(`${appUrl}/auth/select-role`)
        }
      }

      // For email confirmation, show success page instead of redirecting directly
      if (!next || next === '/') {
        return NextResponse.redirect(`${appUrl}/auth/confirm`)
      }

      return NextResponse.redirect(`${appUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${appUrl}/auth/login?error=auth_callback_failed`)
}
