import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ig_auth'

function loadStoredAuth() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth)

  const persist = useCallback((value) => {
    setAuth(value)
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      // Keep this in sync too, since the backend's static index.html reads this
      // specific key directly for its own (fallback) connect button.
      window.localStorage.setItem('ig_jwt', value.token)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem('ig_jwt')
    }
  }, [])

  const register = useCallback(async (email, password) => {
    const result = await api.register(email, password)
    persist(result)
    return result
  }, [persist])

  const login = useCallback(async (email, password) => {
    const result = await api.login(email, password)
    persist(result)
    return result
  }, [persist])

  const logout = useCallback(() => persist(null), [persist])

  const value = {
    token: auth?.token ?? null,
    email: auth?.email ?? null,
    userId: auth?.userId ?? null,
    isAuthenticated: !!auth?.token,
    register,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
