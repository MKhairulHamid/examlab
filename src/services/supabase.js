import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants.js'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ Supabase credentials not found')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'examprep-auth'
  }
})

export default supabase

