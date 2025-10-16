import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants.js'

// Create a mock Supabase client for when credentials are missing
const createMockClient = () => {
  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not configured' } })
  }

  return {
    auth: mockAuth,
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null })
        }),
        order: () => ({ data: [], error: null }),
        data: [],
        error: null
      }),
      insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      upsert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: async () => ({ data: null, error: { message: 'Supabase not configured' } })
    })
  }
}

// Check if Supabase credentials are available
const hasCredentials = SUPABASE_URL && SUPABASE_ANON_KEY && 
                      SUPABASE_URL !== 'undefined' && 
                      SUPABASE_ANON_KEY !== 'undefined'

// Create the Supabase client or mock client
export const supabase = hasCredentials
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'cloudexamlab-auth'
      }
    })
  : (() => {
      console.warn('⚠️ Supabase credentials not found - using mock client (landing page will work, but auth features disabled)')
      return createMockClient()
    })()

export default supabase

