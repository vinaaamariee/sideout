import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  getCurrentSession,
  onAuthStateChange,
  type AuthUser 
} from '@/lib/auth'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        set({ isLoading: true })
        
        try {
          const session = await getCurrentSession()
          
          if (session?.user) {
            const user = await getCurrentUser()
            set({ 
              user, 
              isAuthenticated: !!user, 
              isLoading: false,
              isInitialized: true
            })
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              isInitialized: true
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isInitialized: true
          })
        }

        // Listen to auth changes
        onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const user = await getCurrentUser()
            set({ user, isAuthenticated: !!user })
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false })
          }
        })
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        const result = await signIn(email, password)
        
        if (result.success && result.session) {
          const user = await getCurrentUser()
          set({ 
            user, 
            isAuthenticated: !!user, 
            isLoading: false 
          })
          return { success: true }
        } else {
          set({ 
            isLoading: false, 
            error: result.error || 'Login failed' 
          })
          return { success: false, error: result.error }
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null })
        
        const result = await signUp(email, password, fullName)
        
        if (result.success) {
          const loginResult = await signIn(email, password)
          if (loginResult.success) {
            const user = await getCurrentUser()
            set({ 
              user, 
              isAuthenticated: !!user, 
              isLoading: false 
            })
            return { success: true }
          }
        }
        
        set({ 
          isLoading: false, 
          error: result.error || 'Registration failed' 
        })
        return { success: false, error: result.error }
      },

      logout: async () => {
        set({ isLoading: true })
        await signOut()
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'sideout-auth-storage',
      partialize: (state) => ({ 
        user: state.user,
      }),
    }
  )
)