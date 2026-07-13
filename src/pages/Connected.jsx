import { useSearchParams, Link } from 'react-router-dom'

export default function Connected() {
  const [params] = useSearchParams()
  const igUserId = params.get('igUserId')

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-bg-deep px-4 py-12">
      {/* Decorative background blur blobs */}
      <div className="absolute top-1/4 -left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 -right-10 w-80 h-80 bg-accent-primary/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-2xl text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg shadow-emerald-500/10 animate-pulse">
          &#10003;
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">Instagram Connected</h1>
        <p className="text-sm text-text-secondary mb-8">
          {igUserId ? `Account ID: ${igUserId}` : 'Connection completed successfully.'}
        </p>

        <Link 
          className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-accent-primary/25 transition-all text-center" 
          to="/dashboard"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
