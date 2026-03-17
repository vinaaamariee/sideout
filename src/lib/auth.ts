import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

// Auth types
export interface AuthUser {
  id: string
  email: string
  fullName?: string
  role: 'official' | 'admin'
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      return { success: true, user: data.user }
    }

    return { success: false, error: 'Registration failed' }
  } catch (error) {
    console.error('Sign up error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; session?: Session; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.session) {
      return { success: true, session: data.session }
    }

    return { success: false, error: 'Login failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Sign out
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) {
    return null
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get profile from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email || '',
      fullName: profile?.full_name,
      role: profile?.role || 'official',
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) {
    return null
  }
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

// Listen to auth changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabase.auth.onAuthStateChange(callback)
}

// Update user profile
export async function updateProfile(
  userId: string,
  updates: { full_name?: string; role?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Reset password
export async function resetPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' }
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
