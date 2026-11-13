'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import { authApi, ApiError } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setLoading(false)
      return
    }

    setToken(storedToken)
    authApi
      .me()
      .then((userData) => setUser(userData))
      .catch((err) => {
        // Solo se descarta el token si el servidor lo rechaza; un fallo de red no debe cerrar la sesión.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem('token')
          setToken(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((newToken: string, userData: User) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
