import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function SelectPage() {
  const [params] = useSearchParams()
  const selectionToken = params.get('selectionToken')
  const { token } = useAuth()
  const navigate = useNavigate()

  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(null)

  useEffect(() => {
    if (!selectionToken) {
      setError('Missing selectionToken in URL.')
      setLoading(false)
      return
    }
    api.getPendingSelection(selectionToken, token)
      .then(result => setPages(result.pages))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectionToken, token])

  async function handleSelect(pageId) {
    setConnecting(pageId)
    setError(null)
    try {
      const account = await api.selectPage(selectionToken, pageId, token)
      navigate(`/connected?igUserId=${encodeURIComponent(account.igUserId)}`)
    } catch (err) {
      setError(err.message)
      setConnecting(null)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-bg-deep px-4 py-12">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-1/4 -left-10 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 -right-10 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10 w-full max-w-2xl p-6 md:p-10 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-accent-primary animate-pulse"></span>
            <span className="text-xs font-semibold tracking-widest text-accent-primary uppercase">CreatorLinksAI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Choose an account to connect</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your Facebook workspace manages multiple Pages with linked Instagram profiles. Select the target profile to establish the insights link.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <svg className="animate-spin h-8 w-8 text-accent-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-text-secondary">Retrieving options...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pages.map(p => (
              <div 
                key={p.pageId} 
                className="p-4 rounded-2xl bg-bg-deep/40 border border-panel-border hover:border-panel-border/80 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-sm capitalize">
                    {p.igUsername ? p.igUsername[0] : '?'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-text-primary">@{p.igUsername || p.igUserId}</div>
                    <div className="text-xs text-text-secondary mt-0.5">Page: {p.pageName}</div>
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <button 
                    onClick={() => handleSelect(p.pageId)} 
                    disabled={connecting !== null}
                    className="w-full py-2 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {connecting === p.pageId ? 'Connecting...' : 'Connect profile'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
