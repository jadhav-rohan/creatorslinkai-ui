import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { ApiError, api, setAuthenticationFailureHandler } from '../api'
import { clearAuthenticatedSession } from '../services/authenticatedSessionService'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ig_auth'
const RECOGNIZED_PERSONAS = new Set(['CREATOR', 'BRAND'])
const SESSION_NOTICE_KEY = 'creatorlinksai_auth_notice'
const SESSION_EXPIRED_MESSAGE = 'Your session has expired or needs to be refreshed. Please sign in again.'

function clearInvalidStoredAuth() {
  clearAuthenticatedSession()
  window.sessionStorage.setItem(SESSION_NOTICE_KEY, SESSION_EXPIRED_MESSAGE)
}

function loadStoredAuth() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    if (!value?.token || !RECOGNIZED_PERSONAS.has(value?.activePersona)) {
      clearInvalidStoredAuth()
      return null
    }
    return value
  } catch {
    clearInvalidStoredAuth()
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

  const logout = useCallback(({ revoke = true, reason = null } = {}) => {
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
        if (reason === 'expired') window.sessionStorage.setItem(SESSION_NOTICE_KEY, SESSION_EXPIRED_MESSAGE)
        setAuth(null)
        setLoggingOut(false)
        if (window.location.hash !== '#/login') window.location.hash = '/login'
      }
    })()
    logoutPromise.current = operation
    operation.finally(() => { if (logoutPromise.current === operation) logoutPromise.current = null })
    return operation
  }, [auth?.token])

  useEffect(() => {
    setAuthenticationFailureHandler(() => logout({ revoke: false, reason: 'expired' }))
    return () => setAuthenticationFailureHandler(null)
  }, [logout])

  const authenticatePortal = useCallback(async (persona, mode, payload) => {
    const result = persona === 'CREATOR'
      ? await (mode === 'register' ? api.registerCreator(payload.email, payload.password) : api.loginCreator(payload.email, payload.password))
      : await (mode === 'register' ? api.registerBrand(payload.email, payload.password, payload.workspaceName, payload.workspaceType) : api.loginBrand(payload.email, payload.password))
    if (!RECOGNIZED_PERSONAS.has(result?.activePersona) || result.activePersona !== persona) {
      throw new ApiError('The authenticated account does not match this portal.', 403, null)
    }
    persist(result)
    const workspaceId = result.workspaceId || result.defaultWorkspaceId
    if (workspaceId) window.localStorage.setItem(`creatorlinksai_workspace_id_${result.activePersona}`, workspaceId)
    return result
  }, [persist])

  const value = {
    token: auth?.token ?? null,
    email: auth?.email ?? null,
    userId: auth?.userId ?? null,
    expiresInSeconds: auth?.expiresInSeconds ?? null,
    activePersona: auth?.activePersona ?? null,
    personas: Array.isArray(auth?.personas) ? auth.personas : [],
    workspaceId: auth?.workspaceId ?? auth?.defaultWorkspaceId ?? null,
    defaultWorkspaceId: auth?.workspaceId ?? auth?.defaultWorkspaceId ?? null,
    workspaceType: auth?.workspaceType ?? null,
    isAuthenticated: !!auth?.token,
    isCreatorPortal: auth?.activePersona === 'CREATOR',
    isBrandPortal: auth?.activePersona === 'BRAND',
    activeWorkspaceId: auth?.workspaceId ?? auth?.defaultWorkspaceId ?? null,
    canAccessPersona: (persona) => Array.isArray(auth?.personas) && auth.personas.includes(persona),
    authenticatePortal,
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
