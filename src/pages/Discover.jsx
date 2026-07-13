import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function Discover() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const initialUsername = searchParams.get('username') || ''

  const [username, setUsername] = useState(initialUsername)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const performSearch = useCallback(async (targetUser) => {
    if (!targetUser.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const result = await api.discoverCreator(targetUser.trim().replace(/^@/, ''), token)
      setProfile(result)
    } catch (err) {
      setProfile(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Automatically trigger search if username is present in the URL query string
  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername)
      performSearch(initialUsername)
    }
  }, [initialUsername, performSearch])

  async function handleSearch(e) {
    e.preventDefault()
    performSearch(username)
  }

  // Format large numbers for dashboard readability
  function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header Search Panel Bento Card (col-span-3) */}
        <section className="p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
          <div className="mb-4">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-primary transition-colors group">
              <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to dashboard
            </Link>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">Discover Public Creators</h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1 mb-6 leading-relaxed">
              Search any public Instagram Business or Creator account by username. Only public stats are shown - Meta restricts rich demographic and reach insights to the owner.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-text-secondary/40 font-semibold text-sm">@</span>
              <input
                type="text"
                placeholder="username (e.g. nike)"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-bg-deep/60 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-accent-primary hover:bg-accent-primary/95 text-white text-sm font-semibold shadow-lg shadow-accent-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Searching...' : 'Lookup Creator'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Loading indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <svg className="animate-spin h-8 w-8 text-accent-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-text-secondary">Querying Meta public registry...</span>
          </div>
        )}

        {/* Profile Results Bento Grid */}
        {profile && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cell 1: Profile card (col-span-1) */}
            <div className="p-6 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.username}
                      className="w-14 h-14 rounded-full border border-panel-border object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-lg">
                      {profile.username ? profile.username[0].toUpperCase() : '@'}
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-base text-text-primary">@{profile.username}</h2>
                    {profile.website && (
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-accent-primary hover:text-accent-secondary transition-colors truncate max-w-[160px] block"
                      >
                        {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    )}
                  </div>
                </div>
                
                {profile.biography ? (
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                    {profile.biography}
                  </p>
                ) : (
                  <p className="text-xs text-text-secondary/40 italic">No biography text setup.</p>
                )}
              </div>
              
              <div className="border-t border-panel-border/40 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-text-secondary/60">Type: Public Creator</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>

            {/* Cell 2: Quick Metrics Overview (col-span-2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-2">
              
              {/* Stat card: Followers */}
              <div className="p-6 rounded-3xl bg-panel/50 border border-panel-border shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Followers</span>
                    <div className="h-7 w-7 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-text-primary tracking-tight" title={profile.followersCount.toLocaleString()}>
                    {formatNumber(profile.followersCount)}
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary/70 mt-4">Audience size of creator channel</p>
              </div>

              {/* Stat card: Total posts */}
              <div className="p-6 rounded-3xl bg-panel/50 border border-panel-border shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Total Posts</span>
                    <div className="h-7 w-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-text-primary tracking-tight">
                    {profile.mediaCount.toLocaleString()}
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary/70 mt-4">Lifetime catalog content items</p>
              </div>

            </div>

            {/* Cell 3: Recent posts log (col-span-3) */}
            <div className="md:col-span-3 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
              <h2 className="text-base font-bold tracking-tight text-text-primary mb-1">Recent Catalog Feed</h2>
              <p className="text-xs text-text-secondary mb-6">
                Engagement parameters of latest content pieces published.
              </p>

              {profile.recentMedia.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-secondary border border-dashed border-panel-border rounded-xl">
                  No public posts detected on this profile.
                </div>
              ) : (
                <div className="divide-y divide-panel-border/60">
                  {profile.recentMedia.map(m => (
                    <div 
                      key={m.mediaId} 
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="max-w-xl">
                        <p className="text-xs font-medium text-text-primary line-clamp-2 leading-relaxed">
                          {m.caption || <span className="text-text-secondary/40 italic">No caption provided</span>}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Likes Badge */}
                        <div className="px-2.5 py-1 rounded-lg bg-panel-light border border-panel-border flex items-center gap-1.5 text-[11px]">
                          <span className="text-text-secondary uppercase font-semibold">Likes</span>
                          <span className="text-text-primary font-bold">{m.likeCount.toLocaleString()}</span>
                        </div>

                        {/* Comments Badge */}
                        <div className="px-2.5 py-1 rounded-lg bg-panel-light border border-panel-border flex items-center gap-1.5 text-[11px]">
                          <span className="text-text-secondary uppercase font-semibold">Comments</span>
                          <span className="text-text-primary font-bold">{m.commentCount.toLocaleString()}</span>
                        </div>

                        {/* Link to Instagram post */}
                        {m.permalink && (
                          <a 
                            href={m.permalink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/20 hover:bg-accent-primary/25 text-accent-primary transition-all flex items-center justify-center"
                            title="View on Instagram"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {searched && !loading && !profile && !error && (
          <div className="py-16 text-center text-xs text-text-secondary border border-dashed border-panel-border rounded-2xl bg-panel/30">
            No public profiles matched that search.
          </div>
        )}
      </div>
    </div>
  )
}
