import { getSupabaseBrowserClient } from '@/modules/auth/utils/supabase-browser'

interface SignInInput {
  email: string
  password: string
}

type SignInResult =
  | { ok: true }
  | {
      ok: false
      message: string
    }

export async function signInWithEmailPassword({
  email,
  password,
}: SignInInput): Promise<SignInResult> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) {
    return {
      ok: false,
      message: 'Unable to sign in with provided credentials.',
    }
  }

  return { ok: true }
}

export async function signOutUser() {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut({ scope: 'local' })

  if (error) {
    throw new Error('Unable to sign out right now.')
  }
}
