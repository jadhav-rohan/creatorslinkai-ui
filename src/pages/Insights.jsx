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

  // Helper to calculate custom engagement rate for reels
  function getEngagementRate(reel) {
    if (!reel.viewCount) return '0.0%'
    const interactions = (reel.likeCount || 0) + (reel.commentCount || 0) + (reel.savedCount || 0)
    const rate = (interactions / reel.viewCount) * 100
    return `${rate.toFixed(1)}%`
  }

  // Format large numbers for dashboard readability
  function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation / Loading & Errors */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 animate-fadeIn mb-6">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="flex-1">{error}</span>
            <Link to="/dashboard" className="text-xs font-semibold underline underline-offset-4 text-red-400 hover:text-red-300">Back</Link>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <svg className="animate-spin h-10 w-10 text-accent-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-text-secondary">Analyzing Instagram insights & reels metrics...</span>
          </div>
        ) : data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Profile Info Bento Cell (col-span-3) */}
            <div className="md:col-span-3 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl flex items-center gap-5">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-2xl md:text-3xl shadow-lg shadow-accent-primary/20">
                {data.username ? data.username[0].toUpperCase() : '@'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">@{data.username || data.igUserId}</h1>
                  <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/25 text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                    Creator Profile
                  </span>
                </div>
                <p className="text-xs md:text-sm text-text-secondary">
                  Detailed analytics snapshot based on the last <strong className="text-text-primary font-semibold">{data.reelsAnalyzed}</strong> reels published.
                </p>
              </div>
            </div>

            {/* Back Button Bento Cell (col-span-1) */}
            <Link 
              to="/dashboard"
              className="p-6 md:p-8 rounded-3xl bg-panel/30 border border-panel-border hover:border-panel-border/80 transition-all duration-300 shadow-xl flex flex-col justify-between group min-h-[120px] md:min-h-0"
            >
              <div className="h-8 w-8 rounded-xl bg-panel-light flex items-center justify-center text-text-secondary group-hover:text-accent-primary transition-colors">
                <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase">Workspace</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Return to dashboard</p>
              </div>
            </Link>

            {/* Key Metrics Bento Blocks */}
            
            {/* Stat Card A: Followers */}
            <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Followers</span>
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-text-primary tracking-tight" title={data.followersCount.toLocaleString()}>
                {formatNumber(data.followersCount)}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">Audience reach capacity</p>
            </div>

            {/* Stat Card B: Media Count */}
            <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Total Posts</span>
                <div className="h-7 w-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-text-primary tracking-tight">
                {data.mediaCount.toLocaleString()}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">Published files count</p>
            </div>

            {/* Stat Card C: Reels Views */}
            <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Reel Views</span>
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-text-primary tracking-tight" title={data.totalReelViews.toLocaleString()}>
                {formatNumber(data.totalReelViews)}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">Aggregate reels view traffic</p>
            </div>

            {/* Stat Card D: Reels Likes */}
            <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Reel Likes</span>
                <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-extrabold text-text-primary tracking-tight" title={data.totalReelLikes.toLocaleString()}>
                {formatNumber(data.totalReelLikes)}
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">Total positive signals</p>
            </div>

            {/* Reels Gallery Panel (col-span-4) */}
            <div className="md:col-span-4 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
              <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">Reels Performance Logs</h2>
              <p className="text-xs text-text-secondary mb-6">
                Specific posts performance and computed engagement metrics.
              </p>

              {data.reels.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-secondary border border-dashed border-panel-border rounded-xl">
                  No video reels detected on this creator profile.
                </div>
              ) : (
                <div className="divide-y divide-panel-border/60">
                  {data.reels.map(reel => (
                    <div 
                      key={reel.mediaId} 
                      className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="max-w-xl">
                        <p className="text-sm font-medium text-text-primary line-clamp-2 leading-relaxed">
                          {reel.caption || <span className="text-text-secondary/40 italic">No caption provided</span>}
                        </p>
                        <p className="text-[10px] text-text-secondary/50 mt-1.5">ID: {reel.mediaId}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Views Badge */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-panel-light border border-panel-border flex items-center gap-1.5">
                          <span className="text-[10px] text-text-secondary uppercase font-semibold">Views</span>
                          <span className="text-xs text-text-primary font-bold">{reel.viewCount.toLocaleString()}</span>
                        </div>
                        
                        {/* Likes Badge */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-panel-light border border-panel-border flex items-center gap-1.5">
                          <span className="text-[10px] text-text-secondary uppercase font-semibold">Likes</span>
                          <span className="text-xs text-text-primary font-bold">{reel.likeCount.toLocaleString()}</span>
                        </div>

                        {/* Comments Badge */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-panel-light border border-panel-border flex items-center gap-1.5">
                          <span className="text-[10px] text-text-secondary uppercase font-semibold">Comments</span>
                          <span className="text-xs text-text-primary font-bold">{reel.commentCount.toLocaleString()}</span>
                        </div>

                        {/* Saves Badge */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-panel-light border border-panel-border flex items-center gap-1.5">
                          <span className="text-[10px] text-text-secondary uppercase font-semibold">Saves</span>
                          <span className="text-xs text-text-primary font-bold">{reel.savedCount.toLocaleString()}</span>
                        </div>

                        {/* Engagement Rate Badge */}
                        <div className="px-2.5 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/25 flex items-center gap-1.5">
                          <span className="text-[10px] text-accent-primary uppercase font-bold">Engagement</span>
                          <span className="text-xs text-accent-primary font-black">{getEngagementRate(reel)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
