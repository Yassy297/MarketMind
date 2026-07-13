# MarketMind

An AI-powered financial research assistant: search companies, view stock data/news, and manage documents, watchlists, and conversations behind JWT-based authentication.

## Structure

npm workspaces monorepo, installed and managed from the repo root:

- `client/` — React + Vite + TypeScript frontend (pages, components, layouts, services, context)
- `server/` — Express + TypeScript + MongoDB (Mongoose) backend, organized MVC-style:
  `controllers/`, `models/`, `routes/`, `services/`, `middleware/`, `config/`

## Running

```bash
npm install        # once, from the repo root — installs both workspaces
npm run dev         # runs backend + frontend concurrently
```

Or individually: `npm run dev -w server` / `npm run dev -w client`.

The backend needs a `server/.env` (see `server/.env.example`) with `MONGO_URI`, `JWT_SECRET`,
`FRONTEND_ORIGIN`, and `FINNHUB_API_KEY`/`OPENAI_API_KEY` for the stock/AI features. The frontend
needs a `client/.env` with `VITE_API_BASE_URL`. No workflow is configured yet since these secrets
aren't set — ask before adding one.

## User preferences

- Keep the monorepo on a single root `package.json` using npm workspaces (`client`, `server`) —
  do not reintroduce per-workspace lockfiles or a root install with no workspaces wired up.
