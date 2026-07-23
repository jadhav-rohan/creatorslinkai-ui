import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Verification links may be opened as normal paths even though the app uses HashRouter.
// Move the query into the hash before React reads it; the verification page removes it
// as soon as the confirmation request finishes.
if (window.location.pathname.endsWith('/verify-email') && !window.location.hash) {
  const basePath = window.location.pathname.slice(0, -'/verify-email'.length) || '/'
  const separator = basePath.endsWith('/') ? '' : '/'
  window.history.replaceState({}, '', `${basePath}${separator}#/verify-email${window.location.search}`)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
