import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/modules/auth/utils/supabase-server'

export interface AuthUser {
  id: string
  email: string | null
}

export const getAuthenticatedUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email ?? null,
    } as AuthUser
  },
)
