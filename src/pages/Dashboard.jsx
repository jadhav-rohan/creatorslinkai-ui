import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function Dashboard() {
  const { token, email, logout } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(false)

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

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div className="topbar">
          <span>Signed in as {email}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link className="btn secondary" to="/discover">Look up a creator</Link>
            <button className="secondary" onClick={logout}>Log out</button>
          </div>
        </div>

        <div className="card card-wide">
          <h1>Your Instagram accounts</h1>
          <p className="subtitle">Connect an Instagram Business/Creator account to view its insights.</p>

          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="spinner-text">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="empty-state">No accounts connected yet.</div>
          ) : (
            <div className="account-list">
              {accounts.map(acc => (
                <div className="account-row" key={acc.igUserId}>
                  <div>
                    <div>@{acc.igUsername || acc.igUserId}</div>
                    <div className="meta">
                      {acc.pageName ? `Page: ${acc.pageName} · ` : ''}
                      Token expires {new Date(acc.tokenExpiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="actions">
                    <Link className="btn" to={`/insights/${acc.igUserId}`}>View insights</Link>
                    <button className="danger" onClick={() => handleDisconnect(acc.igUserId)}>Disconnect</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="full-width" onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Redirecting to Instagram...' : '+ Connect Instagram account'}
          </button>
        </div>
      </div>
    </div>
  )
}
