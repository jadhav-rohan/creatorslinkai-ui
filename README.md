# CreatorLinksAI - Instagram Insights UI

A small React (Vite) frontend for the [instagram-insights-api](../instagram-insights-api)
backend: register/login, connect an Instagram account, view its insights.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` to point at your backend:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Run locally

```bash
npm run dev
```
Opens on **http://localhost:5173**.

**Backend config needed for this to work:**
```bash
export CORS_ALLOWED_ORIGINS="http://localhost:5173"
export IG_OAUTH_SUCCESS_REDIRECT="http://localhost:5173/#/connected"
```
Note the `/#/connected` (not `/connected`) - this app uses `HashRouter`, so the route
lives after the `#`. The backend appends `?igUserId=...` to whatever you set here, and
`.../#/connected?igUserId=123` resolves correctly - React Router parses the query string
from within the hash fragment. Restart the backend after setting these.

## How the OAuth flow works from here

1. User registers/logs in → backend returns a JWT, stored in `localStorage`.
2. Dashboard's "Connect Instagram Creator Account" button calls `GET /api/v1/instagram-login/connect`
   with the JWT in the `Authorization` header. The backend returns `{ authorizationUrl }`
   as JSON (not a redirect - a `fetch()` call can't follow a redirect while keeping the
   auth header).
3. The app does `window.location.href = authorizationUrl` itself, sending the browser to
   Facebook's OAuth dialog.
4. After approval, Meta redirects to the **backend's** `/api/v1/instagram/auth/callback`,
   which exchanges the code, stores the account, then redirects the browser to
   `IG_OAUTH_SUCCESS_REDIRECT` (this app's `/connected` route) with `?igUserId=...`.
5. `/connected` shows a confirmation and links back to the dashboard, which re-fetches the
   account list.

## Pages

- `/login`, `/register` - auth
- `/dashboard` - list connected accounts, connect new ones, disconnect existing ones
- `/insights/:igUserId` - follower/media/reel stats for one account
- `/connected` - post-OAuth landing page (single-Page connect)
- `/select-page` - shown instead of `/connected` when the connecting Facebook account manages multiple Pages with linked Instagram accounts - lets the user pick which one
- `/discover` - look up any public Instagram Business/Creator account by username via Meta's Business Discovery (they don't need to connect). Shows profile basics and recent post engagement only - no audience/insights data, which Meta restricts to the account owner regardless of caller.

## Additional backend env var for this app

```bash
export IG_OAUTH_SELECT_REDIRECT="http://localhost:5173/#/select-page"
```
Without this, the backend returns the selection options as raw JSON instead of redirecting here - set it alongside `IG_OAUTH_SUCCESS_REDIRECT`.

## Meta brand connection and Creator Marketplace

Authenticated users can also connect a brand through `GET /api/v1/instagram/auth/connect`.
Brand connections are listed from `GET /api/v1/instagram/auth/accounts` and are used by
the `/creator-marketplace` page. The creator-owned Instagram connection above remains
separate and continues to power insights and auto-DM functionality.

## Build for production

```bash
npm run build
```
Outputs static files to `dist/` - deploy to Vercel, Netlify, or any static host. Set
`VITE_API_BASE_URL` to your deployed backend URL (e.g. the Railway domain) before building,
and update the backend's `CORS_ALLOWED_ORIGINS` and `IG_OAUTH_SUCCESS_REDIRECT` to match
your deployed frontend URL - remember the `/#/connected` form described above.

This app uses `HashRouter`, so no server-side rewrite rules are needed for routing to work
on a static host - every route resolves through `index.html` and React Router reads the
path after the `#` client-side. (An earlier version of this README suggested a
`vercel.json` rewrite for `BrowserRouter`-style routing; that's no longer needed.)

## Notes

- JWT is stored in `localStorage` - simple and fine for this stage, but vulnerable to XSS
  (any injected script can read it). An httpOnly cookie would be more resistant to that,
  at the cost of needing CSRF protection instead - worth revisiting before this handles
  real user data at scale.
- No token refresh - when the JWT expires (24h by default on the backend), API calls will
  start failing with 401s and the user needs to log in again. There's no automatic
  redirect-to-login on 401 yet.
