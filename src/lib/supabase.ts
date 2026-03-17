import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Skip client creation during build time
const isBrowser = typeof window !== 'undefined'

export const supabase = (isBrowser && supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabase && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.')
}

export const getSupabaseClient = () => {
  return supabase
}