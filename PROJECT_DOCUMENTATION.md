# MarketMind Project Documentation

## Overview

MarketMind is a full-stack SaaS-style research dashboard with a React + Vite + Tailwind CSS frontend and an Express + TypeScript + MongoDB backend. The project includes cookie-based authentication with rotating refresh tokens, protected dashboard routes, a real dashboard summary endpoint, a live Finnhub-powered stock research module, and a dark navy/indigo, glassmorphism-inspired UI redesign applied across all screens (Login, Register, Dashboard, Stocks, Watchlist, Documents, AI Chat, Settings, Profile).

## Root Structure

- `client/` - React frontend application (Vite + Tailwind CSS)
- `server/` - Express backend API and auth server
- `package.json` - npm workspaces root (`client`, `server`); installing once at the root installs both workspaces into a single `node_modules`
- `README.md` - existing project README
- `PROJECT_DOCUMENTATION.md` - this documentation file
- `.data/mongo/` - local MongoDB data directory (gitignored), used by the `MongoDB` workflow

## Design System

The frontend was restyled around a dark "ink" navy/indigo palette defined in `client/tailwind.config.js` (custom `ink` color scale, `brand-gradient` utilities, glow/card shadow utilities). Key shared primitives:

- `components/ui/button.tsx`, `components/ui/input.tsx` - base styled controls
- `components/DashboardCard.tsx`, `components/PageHeader.tsx` - shared surfaces
- `components/Sidebar.tsx` - icon-based nav (lucide-react + framer-motion), tied only to real routes
- `components/Navbar.tsx` - search bar, bell, settings, user avatar (initials from `useAuth`)
- `layouts/DashboardLayout.tsx` - authenticated app shell (Sidebar + Navbar)
- `layouts/AuthLayout.tsx` - split-panel layout with an animated CSS/SVG gradient orb graphic for Login/Register

`client/src/styles.css` holds the Tailwind base layer, dark theme base styles, and a custom scrollbar. Every page/component reflects only real data returned by the backend — no fabricated metrics or placeholder functionality were added during the redesign.

## Stock Intelligence Module

The stock intelligence module uses live Finnhub data end to end. The backend stores the API key in environment variables/secrets, keeps it server-side, and exposes protected endpoints for company search, profile, quote, news, analyst recommendations, and recently viewed history. The frontend provides a single Stocks page (`pages/Stocks.tsx`) combining live search, company header, financial metrics, news, and analyst recommendation widgets.

### Backend stock endpoints
- `GET /api/stocks/search?q=`
- `GET /api/stocks/:symbol/profile`
- `GET /api/stocks/:symbol/quote`
- `GET /api/stocks/:symbol/news`
- `GET /api/stocks/:symbol/recommendation`
- `GET /api/recently-viewed`

### Frontend stock experience
- Live search bar with result cards (`StockSearch.tsx`, `StockCard.tsx`)
- Company detail view driven by backend profile and quote endpoints (`StockHeader.tsx`, `FinancialCard.tsx`)
- Latest news feed and analyst recommendation widget with proportional buy/hold/sell bars (`NewsCard.tsx`, `RecommendationCard.tsx`)
- Recently viewed history persisted per authenticated user in MongoDB
- React Query and Axios-based loading and error states

## Client Structure

`client/`
- `package.json` - frontend dependencies and scripts
- `vite.config.ts` - Vite configuration: dev server on `0.0.0.0:5000`, `allowedHosts: true`, and a dev proxy forwarding `/api`, `/health`, and `/auth` (API calls only) to the backend on port 5001
- `tailwind.config.js`, `postcss.config.js` - Tailwind CSS setup
- `src/`
  - `main.tsx` - app bootstrap
  - `App.tsx` - root app component
  - `AppRoutes.tsx` - React Router route configuration and auth protection
  - `pages/` - page components for Dashboard, Login, Register, Stocks, Documents, AI Chat, Watchlist, Settings, Profile, NotFound
  - `layouts/` - `DashboardLayout` and `AuthLayout`
  - `context/AuthContext.tsx` - auth state provider; hydrates the current user from `/auth/me` (cookie session) on load, exposes `user`, `loading`, `setUser`, `logout`
  - `services/api.ts` - Axios instance (`withCredentials: true`) with a response interceptor that transparently calls `/auth/refresh` and retries once on a `401`, then dispatches `auth:unauthorized`
  - `services/auth.service.ts` - frontend auth API wrapper for `login`, `register`, `fetchMe`, `logout`
  - `components/` - UI components such as `Sidebar`, `Navbar`, cards, buttons, inputs, etc.

## Server Structure

`server/`
- `package.json` - backend dependencies and scripts
- `src/`
  - `server.ts` - app bootstrap and MongoDB connection
  - `app.ts` - Express application configuration: CORS, `cookie-parser`, request logging, route mounting, 404/error handlers
  - `config/`
    - `env.ts` - environment variable loading and typed config (ports, Mongo URI, JWT secret, access/refresh token TTLs)
    - `db.ts` - MongoDB connection helper
  - `controllers/`
    - `auth.controller.ts` - `register`, `login`, `refresh`, `logout`, `getMe` handlers
    - `dashboard.controller.ts` - dashboard summary endpoint handler
    - `stock.controller.ts` - Finnhub-backed stock endpoints and recently-viewed handler
  - `routes/`
    - `auth.routes.ts` - `/auth/*` routes with validation and rate limiting wired in
    - `dashboard.routes.ts` - `/api/dashboard` summary endpoint
    - `stock.routes.ts` - `/api/stocks/*` endpoints
  - `middleware/`
    - `auth.middleware.ts` - auth guard; reads the access token from the `accessToken` httpOnly cookie first, falling back to an `Authorization: Bearer` header
    - `validate.middleware.ts` - generic Zod request-body validator
    - `rateLimit.middleware.ts` - `loginLimiter`, `registerLimiter`, `refreshLimiter` (express-rate-limit)
    - `errorHandler.middleware.ts` - `notFoundHandler` (404 JSON) and a centralized `errorHandler`
  - `models/`
    - `User.ts` - user schema and model
    - `RefreshToken.ts` - hashed refresh tokens with a Mongo TTL index for automatic expiry cleanup
    - `Document.ts`, `Conversation.ts`, `Watchlist.ts`, `Activity.ts`, `RecentlyViewed.ts` - user-owned records
  - `services/`
    - `auth.service.ts` - register/login/refresh/revoke logic, password hashing, access-token signing, refresh-token issuance and rotation
    - `dashboard.service.ts` - dashboard summary aggregation for authenticated users
    - `stock.service.ts` - Finnhub API integration
  - `validators/`
    - `auth.validators.ts` - Zod schemas for register/login payloads
  - `utils/`
    - `cookies.ts` - `setAuthCookies` / `clearAuthCookies` helpers (httpOnly, `secure` in production, `sameSite: lax`)
  - `types/` - shared server types

## Authentication Flow

Authentication is fully cookie-based: the browser never sees a raw token in JavaScript, `localStorage`, or the response body. All cookies are `httpOnly`, `sameSite: lax`, and `secure` in production.

### Tokens

- **Access token** - a JWT signed with `JWT_SECRET`, default TTL 15 minutes, set in an `accessToken` cookie (`path=/`).
- **Refresh token** - a random opaque token, default TTL 30 days, set in a `refreshToken` cookie (`path=/auth`). Only its SHA-256 hash is stored server-side, in the `RefreshToken` collection. Every use rotates the token: the old one is revoked and a new pair is issued, so a captured refresh token cannot be replayed after its first legitimate use. Expired documents are pruned automatically via a Mongo TTL index.

### Frontend

- User signs in on `client/src/pages/Login.tsx`, registers on `client/src/pages/Register.tsx`
- On success, the server sets the auth cookies and returns `{ user }`; `AuthContext.setUser` stores the user in memory only
- On app load, `AuthContext` calls `GET /auth/me` to hydrate the session from the existing cookie (if any)
- The Axios interceptor in `services/api.ts` catches `401` responses from non-auth endpoints, calls `POST /auth/refresh` once, and retries the original request; if refresh fails it dispatches `auth:unauthorized`, which clears `user` in `AuthContext`
- Protected routes require auth and redirect unauthenticated users to `/auth/login`
- Logout calls `POST /auth/logout` (revokes the refresh token server-side and clears both cookies) and clears local state

### Backend

- `POST /auth/register` - creates a user, issues an access + refresh token pair as cookies. Rate-limited (10/hour per IP) and validated with Zod.
- `POST /auth/login` - verifies credentials, issues a new token pair. Rate-limited (10/15 min per IP) and validated with Zod.
- `POST /auth/refresh` - reads the `refreshToken` cookie, validates + rotates it, issues a new pair. Rate-limited (60/15 min per IP).
- `POST /auth/logout` - revokes the current refresh token and clears both cookies.
- `GET /auth/me` - returns the current user; requires a valid access token (cookie or Bearer header).
- Passwords are hashed with `bcryptjs`.

## API Endpoints

### Auth API

`POST /auth/register`
- Request body: `{ name: string, email: string, password: string }` (validated: name required, valid email, password ≥ 6 chars)
- Sets `accessToken` and `refreshToken` httpOnly cookies
- Response: `{ user: { id, email, name, role } }`

`POST /auth/login`
- Request body: `{ email: string, password: string }`
- Sets `accessToken` and `refreshToken` httpOnly cookies
- Response: `{ user: { id, email, name, role } }`

`POST /auth/refresh`
- No request body; requires the `refreshToken` cookie
- Rotates and re-sets both cookies
- Response: `{ user: { id, email, name, role } }`

`POST /auth/logout`
- No request body; revokes the refresh token and clears both cookies
- Response: `204 No Content`

`GET /auth/me`
- Requires a valid access token (via `accessToken` cookie, or `Authorization: Bearer <token>` for non-browser clients)
- Response: `{ user: { id, email, name, role } }`

### App API

`GET /api/dashboard` - counts and recent activity for the authenticated user:
- `documentsCount`
- `watchlistCount`
- `conversationsCount`
- `recentlyViewedCompanies`
- `recentActivity`

`GET /api/stocks/search?q=`, `GET /api/stocks/:symbol/profile`, `GET /api/stocks/:symbol/quote`, `GET /api/stocks/:symbol/news`, `GET /api/stocks/:symbol/recommendation`, `GET /api/recently-viewed`

`GET /health` - service health check

These routes are defined in `server/src/routes/*.routes.ts` and mounted in `server/src/app.ts`. Any unmatched route returns a JSON `404` via `notFoundHandler`, and uncaught errors are returned as a JSON `500` via `errorHandler`.

## Environment Variables & Secrets

Managed as Replit secrets/env vars (no `.env` file is used in this environment):

- `PORT` - backend port (the `dev` script overrides this to `5001` in development so the frontend can own port `5000`)
- `NODE_ENV` - `development` / `production`; controls the `secure` flag on auth cookies
- `MONGO_URI` - MongoDB connection string. In this environment it points at `mongodb://127.0.0.1:27017/marketmind`, served by the local `MongoDB` workflow (see below)
- `JWT_SECRET` - access token signing secret
- `SESSION_SECRET` - reserved for session-based features
- `FINNHUB_API_KEY` - Finnhub API key for the stock module
- `OPENAI_API_KEY` - reserved for AI Chat functionality
- `ACCESS_TOKEN_TTL_MINUTES` (optional, default `15`) and `REFRESH_TOKEN_TTL_DAYS` (optional, default `30`) - override auth token lifetimes
- `FRONTEND_ORIGIN` (optional) - additional allowed CORS origin beyond the built-in dev origins

Client-side (optional, `client/.env`):
- `VITE_API_BASE_URL` / `VITE_API_URL` - override the API base URL; defaults to same-origin relative URLs (works with the Vite dev proxy and in production)

## Running the Project

Dependencies are managed with npm workspaces from the repo root — run `npm install` once at the project root; it installs both `client` and `server` into a single top-level `node_modules`.

This project runs via two Replit workflows:

- **MongoDB** - `mkdir -p .data/mongo && mongod --dbpath .data/mongo --bind_ip 127.0.0.1 --port 27017 --quiet` (must be running before the app starts)
- **Start application** - `npm run dev`, which runs the backend (port `5001`) and frontend (port `5000`, the previewed port) concurrently via `concurrently`

### Both (from root, outside of Replit workflows)

```bash
npm install
npm run dev
```

### Backend only

```bash
npm run dev -w server
```

### Frontend only

```bash
npm run dev -w client
```

## Notes

- Client routing is managed by `React Router v7` with layout-based nested routes.
- Backend uses `cors` with `credentials: true` and an explicit allow-list of dev/prod origins (required for cookies to flow cross-origin where applicable).
- Auth is cookie-based (httpOnly access + rotating refresh tokens); no token is ever stored in `localStorage` or exposed to client JS.
- The Vite dev proxy only forwards actual `/auth` **API** calls (POST register/login/refresh/logout, GET me) to the backend; plain `GET` page navigations to `/auth/login` and `/auth/register` are left for the SPA/React Router to handle, since those paths are also frontend routes.
- The frontend API client uses Axios, auto-refreshes an expired access token once per request via `/auth/refresh`, and dispatches `auth:unauthorized` when the session cannot be restored.
- `server/src/app.ts` exposes `/health` for service health checks.
- The Watchlist and Documents pages currently call `/api/watchlist` and `/api/documents` endpoints that are not yet implemented server-side; the UI degrades gracefully to styled empty states rather than erroring. This is a known gap, not a regression from the redesign.
- AI Chat and Settings pages are styled but intentionally not wired to backend functionality yet (no chat/save endpoints exist).

## Current Status

- Authentication is production-grade for a first pass: httpOnly cookie sessions, rotating refresh tokens, per-route rate limiting, and Zod request validation
- Local MongoDB runs as its own Replit workflow, backed by a persistent `.data/mongo` directory
- Full visual redesign applied across all 9 screens using Tailwind CSS and a shared dark "ink" design system
- Protected dashboard routes in place; Dashboard page loads live, user-specific counts and activity from the backend
- Stock research module fully wired to live Finnhub data
- Frontend and backend connected via the Vite dev proxy in development and same-origin relative URLs in production
- Known gaps: Watchlist/Documents backend endpoints and AI Chat/Settings functionality are not yet implemented (out of scope for the design + auth-hardening work completed so far)
