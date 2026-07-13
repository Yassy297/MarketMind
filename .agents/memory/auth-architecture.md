---
name: Auth architecture
description: How this project's (MarketMind) auth is structured — cookie-based JWT with rotating refresh tokens — and a Vite proxy pitfall it ran into.
---

Auth uses httpOnly cookies as the sole source of truth on the client (no token ever touches client-side JS/localStorage):
- Short-lived JWT access token (cookie, path `/`).
- Opaque random refresh token (cookie, path `/auth`), hashed (sha256) before being stored in a `RefreshToken` Mongo collection with a TTL index; each use rotates (revokes old, issues new) so replay is not possible.
- Axios response interceptor retries a request once after calling `/auth/refresh` on a 401, then gives up and fires an `auth:unauthorized` event.
- Login/register/refresh are rate-limited via `express-rate-limit`; request bodies are validated with `zod`.

**Why the Vite proxy needed a bypass:** the frontend has page routes at `/auth/login` and `/auth/register` (React Router), and the backend API is also mounted at `/auth/*`. A blanket Vite dev-proxy rule for `/auth` swallowed the GET page navigations and returned the backend's 404 JSON instead of the SPA shell.

**How to apply:** when a backend API and frontend page routes share a path prefix, scope the dev proxy by method/Accept header (bypass GET+`text/html` navigations to those specific paths) rather than proxying the whole prefix.
