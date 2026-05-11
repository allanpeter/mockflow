import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type CurrentUserProfile = {
  full_name: string
  avatar_url: string | null
  role: string
}

export type CurrentUser = {
  id: string
  profile: CurrentUserProfile | null
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single<CurrentUserProfile>()

  return { id: user.id, profile }
})
