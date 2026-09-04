import React from 'react';
import { Outlet } from 'react-router-dom';
import BrandMark from '../components/BrandMark';

const AuthLayout: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4 text-fg">
    <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-xl border border-line bg-surface shadow-card lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
        <div className="mb-10 flex items-center gap-2">
          <BrandMark size={32} />
          <span className="text-[15px] font-semibold tracking-tight text-fg">MarketMind</span>
        </div>
        <Outlet />
      </div>

      <div className="relative hidden overflow-hidden bg-background-secondary lg:block">
        <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative flex h-full flex-col items-center justify-center gap-6 p-10">
          <BrandMark size={72} className="rounded-2xl shadow-card" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-fg">Research smarter, not harder</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-fg-secondary">
              Track markets, review your journal, and keep research in one focused workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
