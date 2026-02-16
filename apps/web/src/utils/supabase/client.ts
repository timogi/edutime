import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
// Important: This client is created once and reused across the app
// Never create a new client in components or hooks to avoid deadlocks
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
)
