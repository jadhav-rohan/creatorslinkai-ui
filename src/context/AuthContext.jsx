import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { api, setAuthenticationFailureHandler } from '../api'
import { clearAuthenticatedSession } from '../services/authenticatedSessionService'

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
  const [loggingOut, setLoggingOut] = useState(false)
  const logoutPromise = useRef(null)
  const sessionEnded = useRef(false)

  const persist = useCallback((value) => {
    if (value) sessionEnded.current = false
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

  const logout = useCallback(({ revoke = true } = {}) => {
    if (logoutPromise.current) return logoutPromise.current
    if (sessionEnded.current) return Promise.resolve()
    const currentToken = auth?.token || window.localStorage.getItem('ig_jwt')
    const operation = (async () => {
      setLoggingOut(true)
      try {
        if (revoke && currentToken) await api.logout(currentToken)
      } catch {
        // Local logout must succeed even when revocation cannot be reached.
      } finally {
        sessionEnded.current = true
        clearAuthenticatedSession()
        setAuth(null)
        setLoggingOut(false)
      }
    })()
    logoutPromise.current = operation
    operation.finally(() => { if (logoutPromise.current === operation) logoutPromise.current = null })
    return operation
  }, [auth?.token])

  useEffect(() => {
    setAuthenticationFailureHandler(() => logout({ revoke: false }))
    return () => setAuthenticationFailureHandler(null)
  }, [logout])

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
    ,loggingOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
