import { useSearchParams, Link } from 'react-router-dom'

export default function Connected() {
  const [params] = useSearchParams()
  const igUserId = params.get('igUserId')

  return (
    <div className="page-center">
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', background: 'rgba(46,204,113,0.15)',
          color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 24
        }}>&#10003;</div>
        <h1>Instagram account connected</h1>
        <p className="subtitle">{igUserId ? `igUserId: ${igUserId}` : 'Connection status unavailable.'}</p>
        <Link className="btn full-width" to="/dashboard">Go to dashboard</Link>
      </div>
    </div>
  )
}
