import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function Insights() {
  const { igUserId } = useParams()
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api.getInsights(igUserId, token)
      .then(result => { if (!cancelled) setData(result) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [igUserId, token])

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div className="topbar">
          <Link to="/dashboard" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>&larr; Back to dashboard</Link>
        </div>

        <div className="card card-wide">
          {loading && <div className="spinner-text">Loading insights...</div>}
          {error && <div className="error-banner">{error}</div>}

          {data && (
            <>
              <h1>@{data.username || data.igUserId}</h1>
              <p className="subtitle">Last {data.reelsAnalyzed} reels analyzed</p>

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="label">Followers</div>
                  <div className="value">{data.followersCount.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Total media</div>
                  <div className="value">{data.mediaCount.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Total reel views</div>
                  <div className="value">{data.totalReelViews.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Total reel likes</div>
                  <div className="value">{data.totalReelLikes.toLocaleString()}</div>
                </div>
              </div>

              <h2>Reels</h2>
              {data.reels.length === 0 ? (
                <div className="empty-state">No reels found.</div>
              ) : (
                <div>
                  {data.reels.map(reel => (
                    <div className="reel-row" key={reel.mediaId}>
                      <div className="caption">{reel.caption || '(no caption)'}</div>
                      <div className="metrics">
                        {reel.viewCount.toLocaleString()} views · {reel.likeCount.toLocaleString()} likes ·{' '}
                        {reel.commentCount.toLocaleString()} comments · {reel.savedCount.toLocaleString()} saves
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
