'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  username: string | null
  isAdmin: boolean
  isAuthenticated: boolean
  login: (username: string) => void
  logout: () => void
}

const ADMIN_USERNAME = 'غيلان بن عقبة'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      username: null,
      isAdmin: false,
      isAuthenticated: false,
      login: (username: string) => {
        const isAdmin = username === ADMIN_USERNAME
        set({ username, isAdmin, isAuthenticated: true })
      },
      logout: () => {
        set({ username: null, isAdmin: false, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
