/**
 * Auth Store - Manage authentication state with Zustand
 */

import { create } from 'zustand'
import supabase from '../services/supabase'
import cacheService from '../services/cacheService'

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  profile: null,
  loading: true,
  error: null,

  // Actions
  
  /**
   * Initialize auth state
   */
  initialize: async () => {
    try {
      set({ loading: true })

      // iOS PWA session handoff via cookie (cookies are shared between Safari
      // and home-screen PWAs on the same domain; localStorage is not)
      const cookieVal = document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('pwa_auth='))
        ?.split('=').slice(1).join('=')

      if (cookieVal) {
        // Always delete the cookie immediately — it's one-time use
        document.cookie = 'pwa_auth=; max-age=0; path=/; SameSite=Lax'
        try {
          const { access_token, refresh_token } = JSON.parse(atob(decodeURIComponent(cookieVal)))
          const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token })
          if (sessionError) console.warn('PWA session handoff failed:', sessionError.message)
        } catch (e) {
          console.warn('PWA auth cookie parse error:', e.message)
        }
      }

      // Check for existing session
      const { data: { user }, error } = await supabase.auth.getUser()

      // Only throw error if it's not a session missing error (which is expected for logged out users)
      if (error && error.name !== 'AuthSessionMissingError') {
        throw error
      }
      
      if (user) {
        set({ user })
        
        // Load profile
        await get().loadProfile(user.id)
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user || null
        set({ user })
        
        if (user) {
          await get().loadProfile(user.id)
        } else {
          set({ profile: null })
          cacheService.remove('user_profile')
        }
      })
      
      set({ loading: false })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ error: error.message, loading: false })
    }
  },

  /**
   * Load user profile (cache-first)
   */
  loadProfile: async (userId) => {
    try {
      // Try cache first
      const cached = cacheService.get('user_profile')
      if (cached) {
        set({ profile: cached })
        
        // Background refresh
        get().refreshProfile(userId)
        return cached
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      if (data) {
        set({ profile: data })
        cacheService.set('user_profile', data, 60 * 60 * 1000) // 1 hour
      }
      
      return data
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  },

  /**
   * Refresh profile from Supabase (background)
   */
  refreshProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      if (data) {
        set({ profile: data })
        cacheService.set('user_profile', data, 60 * 60 * 1000)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      set({ user: data.user, loading: false })
      await get().loadProfile(data.user.id)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Sign up with email and password
   */
  signup: async (email, password, metadata = {}) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: metadata
        }
      })
      
      if (error) throw error
      
      // Create profile if signup successful
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            ...metadata
          })
        } catch (profileError) {
          console.warn('Profile creation error (may already exist):', profileError)
        }
      }
      
      set({ user: data.user, loading: false })
      
      return { success: true, needsVerification: data.user?.identities?.length === 0 }
    } catch (error) {
      console.error('Signup error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      // Redirect happens automatically — no need to set loading: false
    } catch (error) {
      console.error('Google sign-in error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Sign in with magic link
   */
  signInWithMagicLink: async (email, metadata = {}) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: metadata
        }
      })
      
      if (error) throw error
      
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Magic link error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      set({ user: null, profile: null, loading: false })
      cacheService.clearAll()
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Update profile
   */
  updateProfile: async (updates) => {
    try {
      const { user } = get()
      if (!user) throw new Error('No user logged in')
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      set({ profile: data })
      cacheService.set('user_profile', data, 60 * 60 * 1000)
      
      return { success: true, data }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Update password error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Send magic link (passwordless login)
   */
  sendMagicLink: async (email, metadata = {}) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: metadata
        }
      })
      
      if (error) throw error
      
      set({ loading: false })
      return { success: true }
    } catch (error) {
      console.error('Magic link error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  }
}))

export default useAuthStore

