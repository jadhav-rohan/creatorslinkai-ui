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
    <div className="page-center">
      <div className="card card-wide">
        <h1>Choose an account to connect</h1>
        <p className="subtitle">
          Your Facebook account manages multiple Pages with a linked Instagram account.
          Pick the one you want to connect.
        </p>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="spinner-text">Loading options...</div>
        ) : (
          <div className="account-list">
            {pages.map(p => (
              <div className="account-row" key={p.pageId}>
                <div>
                  <div>@{p.igUsername || p.igUserId}</div>
                  <div className="meta">Page: {p.pageName}</div>
                </div>
                <div className="actions">
                  <button onClick={() => handleSelect(p.pageId)} disabled={connecting !== null}>
                    {connecting === p.pageId ? 'Connecting...' : 'Connect this one'}
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
