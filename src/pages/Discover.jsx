import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function Discover() {
  const { token } = useAuth()
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const result = await api.discoverCreator(username.trim().replace(/^@/, ''), token)
      setProfile(result)
    } catch (err) {
      setProfile(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div className="topbar">
          <Link to="/dashboard" style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>&larr; Back to dashboard</Link>
        </div>

        <div className="card card-wide">
          <h1>Look up a creator</h1>
          <p className="subtitle">
            Search any public Instagram Business/Creator account by username - they don't
            need to connect. Audience insights aren't available for accounts other than
            your own; this shows public profile and post stats only.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="username (without @)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
          </form>

          {error && <div className="error-banner" style={{ marginTop: 16 }}>{error}</div>}

          {profile && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                {profile.profilePictureUrl && (
                  <img
                    src={profile.profilePictureUrl}
                    alt={profile.username}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>@{profile.username}</div>
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)' }}>
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>

              {profile.biography && <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>{profile.biography}</p>}

              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 24 }}>
                <div className="stat-card">
                  <div className="label">Followers</div>
                  <div className="value">{profile.followersCount.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Total posts</div>
                  <div className="value">{profile.mediaCount.toLocaleString()}</div>
                </div>
              </div>

              <h2>Recent posts</h2>
              {profile.recentMedia.length === 0 ? (
                <div className="empty-state">No public posts found.</div>
              ) : (
                profile.recentMedia.map(m => (
                  <div className="reel-row" key={m.mediaId}>
                    <div className="caption">{m.caption || '(no caption)'}</div>
                    <div className="metrics">
                      {m.likeCount.toLocaleString()} likes · {m.commentCount.toLocaleString()} comments
                      {m.permalink && (
                        <> · <a href={m.permalink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>View</a></>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {searched && !loading && !profile && !error && (
            <div className="empty-state">No results.</div>
          )}
        </div>
      </div>
    </div>
  )
}
