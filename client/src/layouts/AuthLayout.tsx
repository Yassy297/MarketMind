import React from 'react';
import { Outlet } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-4 text-slate-100">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-white/6 bg-ink-900/60 shadow-card lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
              <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">MarketMind</span>
          </div>
          <Outlet />
        </div>

        <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
          <div className="absolute inset-0">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-violet-600/40 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
            <div className="absolute left-1/3 top-1/3 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-2xl" />
          </div>
          <div className="relative flex h-full flex-col items-center justify-center gap-8 p-10">
            <div className="relative flex h-56 w-56 items-center justify-center">
              <div className="absolute h-full w-full rounded-[40%] bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 opacity-90 shadow-[0_0_80px_rgba(124,58,237,0.55)]" style={{ animation: 'spin 22s linear infinite' }} />
              <div className="absolute h-40 w-40 rounded-[45%] bg-gradient-to-tr from-fuchsia-400/80 to-indigo-400/60 mix-blend-screen blur-[2px]" style={{ animation: 'spin 16s linear infinite reverse' }} />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-ink-950/70 ring-1 ring-white/20 backdrop-blur">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">Research smarter, not harder</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">
                Track markets, chat with your documents, and manage watchlists — all in one focused workspace.
              </p>
            </div>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
