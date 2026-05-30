import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'
  const role = searchParams.get('role')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback?next=${next}`,
      skipBrowserRedirect: true,
      ...(role ? { queryParams: { role } } : {}),
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_failed`)
  }

  return NextResponse.redirect(data.url)
}
