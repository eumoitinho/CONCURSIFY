import { createClient } from '@supabase/supabase-js'

// Para uso em Server Components
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Para uso em Client Components
export const createClientSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing')
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }
  })
}

// Cliente padrão para uso em client-side
export const supabase = createClientSupabaseClient()