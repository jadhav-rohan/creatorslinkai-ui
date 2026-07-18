import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ig_auth'

function loadStoredAuth() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    return value?.token && value?.activePersona ? value : null
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

  const authenticatePortal = useCallback(async (persona, mode, payload) => {
    const result = persona === 'CREATOR'
      ? await (mode === 'register' ? api.registerCreator(payload.email, payload.password) : api.loginCreator(payload.email, payload.password))
      : await (mode === 'register' ? api.registerBrand(payload.email, payload.password, payload.workspaceName, payload.workspaceType) : api.loginBrand(payload.email, payload.password))
    persist(result)
    if (result.defaultWorkspaceId) window.localStorage.setItem('creatorlinksai_workspace_id', result.defaultWorkspaceId)
    return result
  }, [persist])

  const value = {
    token: auth?.token ?? null,
    email: auth?.email ?? null,
    userId: auth?.userId ?? null,
    expiresInSeconds: auth?.expiresInSeconds ?? null,
    activePersona: auth?.activePersona ?? null,
    personas: Array.isArray(auth?.personas) ? auth.personas : [],
    defaultWorkspaceId: auth?.defaultWorkspaceId ?? null,
    workspaceType: auth?.workspaceType ?? null,
    isAuthenticated: !!auth?.token,
    isCreatorPortal: auth?.activePersona === 'CREATOR',
    isBrandPortal: auth?.activePersona === 'BRAND',
    activeWorkspaceId: auth?.defaultWorkspaceId ?? null,
    canAccessPersona: (persona) => Array.isArray(auth?.personas) && auth.personas.includes(persona),
    authenticatePortal,
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
