# MarketMind Project Documentation

## Overview

MarketMind is a full-stack SaaS-style research dashboard with a React + Vite frontend and an Express + TypeScript + MongoDB backend. The project now includes authentication, protected dashboard routes, a real dashboard summary endpoint, and a responsive analytics UI for documents, watchlists, conversations, and recently viewed companies.

## Root Structure

- `client/` - React frontend application
- `server/` - Express backend API and auth server
- `package.json` - npm workspaces root (`client`, `server`); installing once at the root installs both workspaces into a single `node_modules`
- `README.md` - existing project README
- `PROJECT_DOCUMENTATION.md` - this documentation file

## Stock Intelligence Module

The stock intelligence module now uses live Finnhub data end to end. The backend stores the API key in environment variables, keeps it server-side, and exposes protected endpoints for company search, profile, quote, news, analyst recommendations, and recently viewed history. The frontend provides a dedicated Stocks page with live search, company details, price cards, profile cards, news cards, recommendation cards, and recently viewed history.

### Backend stock endpoints
- `GET /api/stocks/search?q=`
- `GET /api/stocks/:symbol/profile`
- `GET /api/stocks/:symbol/quote`
- `GET /api/stocks/:symbol/news`
- `GET /api/stocks/:symbol/recommendation`
- `GET /api/recently-viewed`

### Frontend stock experience
- Live search bar with result cards
- Company detail view driven by backend profile and quote endpoints
- Latest news feed and analyst recommendation widget
- Recently viewed history persisted per authenticated user in MongoDB
- React Query and Axios-based loading and error states

## Client Structure

`client/`
- `package.json` - frontend dependencies and scripts
- `vite.config.ts` - Vite configuration
- `src/`
  - `main.tsx` - app bootstrap
  - `App.tsx` - root app component
  - `AppRoutes.tsx` - React Router route configuration and auth protection
  - `pages/` - page components for Dashboard, Login, Register, Stocks, Documents, AI Chat, Watchlist, Settings, Profile, NotFound
  - `layouts/` - `DashboardLayout` and `AuthLayout`
  - `context/AuthContext.tsx` - auth state provider, token restore, logout logic
  - `services/api.ts` - Axios instance with base URL, auth header setter, 401 interceptor
  - `services/auth.service.ts` - frontend auth API wrapper for login/register/fetchMe
  - `components/` - UI components such as `Sidebar`, `Navbar`, cards, buttons, inputs, etc.

## Server Structure

`server/`
- `package.json` - backend dependencies and scripts
- `src/`
  - `server.ts` - app bootstrap and MongoDB connection
  - `app.ts` - Express application configuration, CORS, routes
  - `config/`
    - `env.ts` - environment variable loading and typed config
    - `db.ts` - MongoDB connection helper
  - `controllers/`
    - `auth.controller.ts` - auth request handlers
    - `api.controller.ts` - market-related API handlers
    - `dashboard.controller.ts` - dashboard summary endpoint handler
  - `routes/`
    - `auth.routes.ts` - `/auth/login` and `/auth/register`
    - `api.routes.ts` - `/api/*` endpoints
    - `dashboard.routes.ts` - `/api/dashboard` summary endpoint
  - `middleware/`
    - `auth.middleware.ts` - JWT bearer auth guard
  - `models/`
    - `User.ts` - user schema and model
    - `Document.ts` - user-owned document records
    - `Conversation.ts` - user-owned conversation records
    - `Watchlist.ts` - user-owned watchlist records
    - `Activity.ts` - recent user activity feed and company views
  - `services/`
    - `auth.service.ts` - register/login logic, password hashing, JWT response build
    - `dashboard.service.ts` - dashboard summary aggregation for authenticated users
  - `types/` - shared server types

## Authentication Flow

### Frontend

- User signs in on `client/src/pages/Login.tsx`
- User registers on `client/src/pages/Register.tsx`
- `AuthContext` stores token, user, and restores session from `localStorage`
- On page load, `AuthContext` calls `/auth/me` to validate the saved token
- Protected routes require auth and redirect unauthenticated users to `/auth/login`
- Logout removes token from storage and clears auth state

### Backend

- `POST /auth/register` accepts `{ name, email, password }`
- `POST /auth/login` accepts `{ email, password }`
- `GET /auth/me` returns current user when valid bearer token is provided
- JWT is signed using `JWT_SECRET` and expires in `1h`
- User passwords are hashed with `bcryptjs`

## API Endpoints

### Auth API

`POST /auth/register`
- Request body: `{ name: string, email: string, password: string }`
- Response: `{ token: string, user: { id, email, name, role } }`

`POST /auth/login`
- Request body: `{ email: string, password: string }`
- Response: `{ token: string, user: { id, email, name, role } }`

`GET /auth/me`
- Requires `Authorization: Bearer <token>` header
- Response: `{ user: { id, email, name, role } }`

### App API

`GET /api/stocks`
`GET /api/documents`
`GET /api/chat`
`GET /api/watchlist`
`GET /api/dashboard`

The dashboard endpoint returns counts and recent activity for the authenticated user:
- `documentsCount`
- `watchlistCount`
- `conversationsCount`
- `recentlyViewedCompanies`
- `recentActivity`

These routes are defined in `server/src/routes/api.routes.ts` and `server/src/routes/dashboard.routes.ts`, and connected through `server/src/app.ts`.

## Environment Variables

### Server

`server/.env`
- `PORT=5000`
- `NODE_ENV=development`
- `MONGO_URI=mongodb://127.0.0.1:27017/marketmind`
- `JWT_SECRET=change-me`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `OPENAI_API_KEY=`
- `FINNHUB_API_KEY=`

### Client

`client/.env`
- `VITE_API_BASE_URL=http://localhost:5000`
- `VITE_API_URL=http://localhost:5000` (legacy fallback)

## Running the Project

Dependencies are managed with npm workspaces from the repo root — run `npm install` once at the project root; it installs both `client` and `server` into a single top-level `node_modules`.

### Both (from root)

```bash
npm install
npm run dev
```

This runs the backend and frontend dev servers concurrently.

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
- Backend uses `cors` with a configured allowed origin and credentials enabled.
- Auth is JWT-based, and token persistence is handled in `localStorage`.
- The frontend API client uses Axios and auto-dispatches `auth:unauthorized` on 401 responses.
- `server/src/app.ts` exposes `/health` for service health checks.

## Current Status

- Authentication flow wired through real backend endpoints
- Protected dashboard routes in place
- Dashboard page now loads live user-specific counts from the backend
- Reusable dashboard UI components include stats cards, recent activity, and market snapshot panels
- Frontend and backend connected using environment-driven API base URL
- Core documentation and architecture layout defined in this file
