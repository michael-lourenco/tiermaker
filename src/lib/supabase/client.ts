import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Desabilitar logs do Supabase no browser
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        logLevel: 'silent', // Silenciar todos os logs do realtime
      },
      // Desabilitar logs gerais do Supabase
      global: {
        headers: {},
      },
    }
  )
}


