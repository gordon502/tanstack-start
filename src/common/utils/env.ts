interface PublicEnv {
  supabaseUrl: string
  supabaseAnonKey: string
}

function getRequiredEnv(name: keyof ImportMetaEnv) {
  const value = import.meta.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env: PublicEnv = {
  supabaseUrl: getRequiredEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getRequiredEnv('VITE_SUPABASE_ANON_KEY'),
}
