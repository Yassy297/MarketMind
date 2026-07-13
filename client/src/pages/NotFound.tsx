import React from 'react';
import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-ink-950 text-slate-100">
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft text-violet-300 ring-1 ring-inset ring-violet-500/30">
        <CompassIcon className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">404 — Page not found</h1>
      <p className="mt-3 text-sm text-slate-400">The page you were looking for doesn't exist.</p>
      <div className="mt-8">
        <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:brightness-110">
          Go home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
