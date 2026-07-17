import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { useWorkspace } from '../context/WorkspaceContext'

export default function Dashboard() {
  const { token, email, logout } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [metaAccounts, setMetaAccounts] = useState([])
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaConnecting, setMetaConnecting] = useState(false)
  const [metaDisconnecting, setMetaDisconnecting] = useState(null)
  const [quickSearch, setQuickSearch] = useState('')
  const navigate = useNavigate()
  const { workspaces, selectedWorkspaceId, setSelectedWorkspaceId, loading: workspacesLoading, error: workspaceError, createWorkspace } = useWorkspace()
  const [workspaceName, setWorkspaceName] = useState('')
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.listAccounts(token)
      setAccounts(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const loadMetaAccounts = useCallback(async () => {
    setMetaLoading(true)
    try {
      const result = await api.listMetaBrandAccounts(token)
      setMetaAccounts(Array.isArray(result) ? result : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setMetaLoading(false)
    }
  }, [token])

  useEffect(() => { loadMetaAccounts() }, [loadMetaAccounts])

  async function handleConnect() {
    setConnecting(true)
    setError(null)
    try {
      const { authorizationUrl } = await api.startConnect(token)
      window.location.href = authorizationUrl
    } catch (err) {
      setError(err.message)
      setConnecting(false)
    }
  }

  async function handleDisconnect(igUserId) {
    if (!window.confirm('Disconnect this account? This revokes access and deletes the stored token.')) return
    try {
      await api.disconnectAccount(igUserId, token)
      setAccounts(prev => prev.filter(a => a.igUserId !== igUserId))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleMetaConnect() {
    if (metaConnecting) return
    setMetaConnecting(true)
    setError(null)
    try {
      const response = await api.startMetaBrandConnect(token)
      if (!response?.authorizationUrl) throw new Error('The server did not return a Meta authorization URL.')
      window.location.assign(response.authorizationUrl)
    } catch (err) {
      setError(err.message)
      setMetaConnecting(false)
    }
  }

  async function handleMetaDisconnect(igUserId) {
    if (!window.confirm('Disconnect this Meta brand account? This revokes access and removes the stored connection.')) return
    setMetaDisconnecting(igUserId)
    setError(null)
    try {
      await api.disconnectMetaBrandAccount(igUserId, token)
      setMetaAccounts(prev => prev.filter(account => account.igUserId !== igUserId))
    } catch (err) {
      setError(err.message)
    } finally {
      setMetaDisconnecting(null)
    }
  }

  function handleQuickSearch(e) {
    e.preventDefault()
    if (!quickSearch.trim()) return
    navigate(`/discover?username=${encodeURIComponent(quickSearch.trim().replace(/^@/, ''))}`)
  }

  async function handleCreateWorkspace(e) {
    e.preventDefault()
    if (creatingWorkspace || !workspaceName.trim()) return
    setCreatingWorkspace(true)
    setError(null)
    try {
      await createWorkspace(workspaceName)
      setWorkspaceName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCreatingWorkspace(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Topbar Bento Cell (Full width card) */}
        <header className="p-6 rounded-2xl bg-panel/40 backdrop-blur-md border border-panel-border flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white shadow-md shadow-accent-primary/20">
              C
            </div>
            <div>
              <span className="text-xs font-semibold text-accent-primary tracking-wider uppercase block">CreatorLinksAI</span>
              <span className="text-xs text-text-secondary">Signed in as <strong className="text-text-primary">{email}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              className="flex-1 sm:flex-initial text-center py-2 px-4 rounded-xl bg-panel-light hover:bg-panel-light/80 text-text-primary text-xs font-medium border border-panel-border transition-all"
              to="/creator-lists"
            >
              Creator Lists
            </Link>
            <Link
              className="flex-1 sm:flex-initial text-center py-2 px-4 rounded-xl bg-panel-light hover:bg-panel-light/80 text-text-primary text-xs font-medium border border-panel-border transition-all"
              to="/creator-marketplace"
            >
              Creator Marketplace
            </Link>
            <Link 
              className="flex-1 sm:flex-initial text-center py-2 px-4 rounded-xl bg-panel-light hover:bg-panel-light/80 text-text-primary text-xs font-medium border border-panel-border transition-all" 
              to="/discover"
            >
              Discover
            </Link>
            <button 
              className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 cursor-pointer transition-all"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-panel-border bg-panel/40 p-5 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="text-sm font-bold">Workspace</h2><p className="mt-1 text-xs text-text-secondary">Creator lists and future collaboration data are scoped to this workspace.</p></div>
            {workspaces.length > 1 && <label className="text-xs text-text-secondary">Current workspace<select aria-label="Current workspace" value={selectedWorkspaceId} onChange={(event) => setSelectedWorkspaceId(event.target.value)} className="mt-1.5 w-full min-w-56 rounded-xl border border-panel-border bg-bg-deep px-3 py-2.5 text-text-primary">{workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}{workspace.personal ? ' (Personal)' : ''}</option>)}</select></label>}
          </div>
          {workspacesLoading && <p className="mt-4 text-xs text-text-secondary">Loading workspaces...</p>}
          {workspaceError && <p role="alert" className="mt-4 text-xs text-red-400">{workspaceError}</p>}
          {!workspacesLoading && workspaces.length === 0 && <form onSubmit={handleCreateWorkspace} className="mt-5 rounded-xl border border-dashed border-panel-border bg-bg-deep/30 p-4"><h3 className="text-sm font-semibold">Create your first workspace</h3><p className="mt-1 text-xs text-text-secondary">A workspace is required for creator lists.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="workspace-name">Workspace name</label><input id="workspace-name" required maxLength={160} value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="Agency workspace" className="flex-1 rounded-xl border border-panel-border bg-bg-deep px-3 py-2.5 text-sm text-text-primary" /><button disabled={creatingWorkspace} className="rounded-xl bg-accent-primary px-5 py-2.5 text-xs font-semibold disabled:opacity-50">{creatingWorkspace ? 'Creating...' : 'Create workspace'}</button></div></form>}
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 animate-fadeIn">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Bento Grid */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Connected Accounts block (col-span-2, tall) */}
          <section className="md:col-span-2 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold tracking-tight text-text-primary">Your Instagram Accounts</h2>
                <span className="px-2.5 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                  {accounts.length} Connected
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-8">
                Connect and manage your Instagram Business or Creator profiles to check target stats.
              </p>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <svg className="animate-spin h-8 w-8 text-accent-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs text-text-secondary">Retrieving active profiles...</span>
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-panel-border rounded-2xl bg-bg-deep/30">
                  <svg className="w-10 h-10 text-text-secondary/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">No Accounts Connected</h3>
                  <p className="text-xs text-text-secondary max-w-xs">
                    Link an account on the right to start loading stats and tracking insights.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {accounts.map(acc => (
                    <div 
                      key={acc.igUserId} 
                      className="p-4 rounded-2xl bg-bg-deep/40 border border-panel-border hover:border-panel-border/80 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-sm capitalize">
                          {acc.igUsername ? acc.igUsername[0] : '?'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-text-primary">@{acc.igUsername || acc.igUserId}</div>
                          <div className="text-xs text-text-secondary mt-1 flex flex-wrap gap-x-2 gap-y-1">
                            {acc.pageName && (
                              <span className="text-[10px] bg-panel-light px-2 py-0.5 rounded border border-panel-border text-text-secondary">
                                Page: {acc.pageName}
                              </span>
                            )}
                            <span className="text-[10px] text-text-secondary/75">
                              Expires {new Date(acc.tokenExpiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link 
                          className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold text-center transition-all shadow-md shadow-accent-primary/10" 
                          to={`/insights/${acc.igUserId}`}
                        >
                          View Insights
                        </Link>
                        <button 
                          className="py-2 px-3 rounded-xl bg-transparent hover:bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/10 cursor-pointer transition-all"
                          onClick={() => handleDisconnect(acc.igUserId)}
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions if loaded */}
            {!loading && accounts.length > 0 && (
              <p className="text-[11px] text-text-secondary/70 text-center mt-6">
                Need to link another page? Use the link card to sign in with your Facebook workspace permissions.
              </p>
            )}
          </section>

          {/* Connections and discovery */}
          <div className="space-y-6 flex flex-col justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Connections</h2>
            
            {/* Connect Account CTA Card (col-span-1) */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-panel/75 to-accent-primary/10 border border-panel-border shadow-xl hover:border-accent-primary/30 transition-all duration-300 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[220px]">
              {/* Subtle background visual accent */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-accent-primary/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <div>
                <div className="h-9 w-9 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold tracking-tight text-text-primary mb-2">Instagram Creator Account</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  Connect your professional Instagram account for creator-owned insights, media and automation.
                </p>
              </div>

              <button 
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-accent-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={handleConnect} 
                disabled={connecting}
              >
                {connecting ? 'Redirecting to Meta...' : 'Connect Instagram Creator Account'}
              </button>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-panel/75 to-accent-secondary/10 border border-panel-border shadow-xl hover:border-accent-secondary/30 transition-all duration-300 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[240px]">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-accent-secondary/20 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="h-9 w-9 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-base font-bold tracking-tight text-text-primary mb-2">Meta Brand Account</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">Connect the Facebook Page linked to your brand’s Instagram business account to search and evaluate creators through Instagram Creator Marketplace.</p>
              </div>
              <button type="button" className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-secondary to-accent-primary hover:opacity-95 text-white text-xs font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all" onClick={handleMetaConnect} disabled={metaConnecting}>
                {metaConnecting ? 'Redirecting to Meta...' : 'Connect Meta Brand Account'}
              </button>
            </div>

            {/* Quick Discover Look up Bento Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl flex-1 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="h-9 w-9 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold tracking-tight text-text-primary mb-2">Quick Lookup</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  Search any public Instagram Business profile to inspect basic posts and follower statistics. No login credentials needed.
                </p>
              </div>

              <form onSubmit={handleQuickSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="username (e.g. nike)"
                  value={quickSearch}
                  onChange={e => setQuickSearch(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-bg-deep/60 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-xs focus:border-accent-secondary focus:ring-1 focus:ring-accent-secondary/20 outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-accent-secondary hover:bg-accent-secondary/90 text-white text-xs font-semibold cursor-pointer shadow-md shadow-accent-secondary/15 transition-all"
                >
                  Go
                </button>
              </form>
            </div>
            
          </div>

        </main>

        <section className="p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><div><h2 className="text-xl font-bold">Meta Brand Connections</h2><p className="mt-1 text-sm text-text-secondary">Facebook Pages linked to brand Instagram business accounts.</p></div><Link to="/creator-marketplace" className="rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 px-4 py-2 text-xs font-semibold text-accent-secondary hover:bg-accent-secondary/20">Open Creator Marketplace</Link></div>
          {metaLoading ? <div className="py-10 text-center text-xs text-text-secondary">Loading Meta brand accounts...</div> : metaAccounts.length === 0 ? <div className="rounded-2xl border border-dashed border-panel-border bg-bg-deep/30 p-8 text-center"><h3 className="text-sm font-semibold">No Meta brand account connected</h3><p className="mt-1 text-xs text-text-secondary">Use the Meta Brand Account connection card above to get started.</p></div> : <div className="grid gap-4 md:grid-cols-2">{metaAccounts.map(account => <div key={account.igUserId} className="rounded-2xl border border-panel-border bg-bg-deep/40 p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">@{account.igUsername || account.igUserId}</div><div className="mt-1 text-xs text-text-secondary">{account.pageName || 'Facebook Page'}</div></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-400">Connected</span></div>{account.tokenExpiresAt && <p className="mt-4 text-[10px] text-text-secondary">Token expires {new Date(account.tokenExpiresAt).toLocaleDateString()}</p>}<button type="button" onClick={() => handleMetaDisconnect(account.igUserId)} disabled={metaDisconnecting !== null} className="mt-4 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50">{metaDisconnecting === account.igUserId ? 'Disconnecting...' : 'Disconnect'}</button></div>)}</div>}
        </section>
      </div>
    </div>
  )
}
