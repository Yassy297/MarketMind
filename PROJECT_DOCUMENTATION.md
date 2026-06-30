# MarketMind Project Documentation

## Overview

MarketMind is a full-stack SaaS-style research dashboard with a React + Vite frontend and an Express + TypeScript + MongoDB backend. The project includes authentication, protected dashboard routes, and API endpoints for market-related content.

## Root Structure

- `client/` - React frontend application
- `server/` - Express backend API and auth server
- `README.md` - existing project README
- `PROJECT_DOCUMENTATION.md` - this documentation file

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
  - `lib/api.ts` - legacy fetch-based API helpers
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
  - `routes/`
    - `auth.routes.ts` - `/auth/login` and `/auth/register`
    - `api.routes.ts` - `/api/*` endpoints
  - `middleware/`
    - `auth.middleware.ts` - JWT bearer auth guard
  - `models/`
    - `User.ts` - user schema and model
    - other models for chat/document/watchlist data
  - `services/`
    - `auth.service.ts` - register/login logic, password hashing, JWT response build
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

These routes are defined in `server/src/routes/api.routes.ts` and connected through `server/src/app.ts`.

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

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
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
- Frontend and backend connected using environment-driven API base URL
- Core documentation and architecture layout defined in this file
