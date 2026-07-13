import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#070417] via-[#07051a] to-[#09041a] text-gray-100">
      <div className="w-full max-w-6xl mx-6 lg:mx-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="bg-gradient-to-br from-white/3 to-white/2 backdrop-blur-sm border border-white/6 rounded-lg p-8 shadow-xl max-w-md mx-auto">
          <div className="mb-6">
            <div className="text-2xl font-bold">MarketMind</div>
            <div className="text-sm text-gray-400">Sign in to continue to your account</div>
          </div>
          <Outlet />
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="p-8 rounded-lg bg-gradient-to-b from-[#0f1220] to-transparent ring-1 ring-white/6">
              <svg width="100%" height="240" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <rect x="0" y="0" width="600" height="240" rx="12" fill="url(#g)" />
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0%" stopColor="#0b1228" />
                    <stop offset="100%" stopColor="#1b0940" />
                  </linearGradient>
                </defs>
              </svg>
              <h3 className="mt-4 text-xl font-semibold">Welcome to MarketMind</h3>
              <p className="mt-2 text-sm text-gray-400">Analyze markets, track watchlists, and manage your documents — all in one elegant interface.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
