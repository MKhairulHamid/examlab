/**
 * Application constants
 */

// Supabase configuration from environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Local storage keys prefix
export const STORAGE_PREFIX = 'cloudexamlab_'

// IndexedDB database name
export const IDB_NAME = 'CloudExamLabDB'
export const IDB_VERSION = 1

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  STORAGE_PREFIX,
  IDB_NAME,
  IDB_VERSION
}

