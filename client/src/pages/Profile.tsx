import React from 'react';
import { Mail, User as UserIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your account information." />

      <DashboardCard className="max-w-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-xl font-semibold text-white">
            {initials}
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{user?.name ?? 'Guest'}</div>
            <div className="text-sm text-slate-500">MarketMind member</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
            <UserIcon className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Full name</div>
              <div className="text-sm font-medium text-slate-200">{user?.name ?? '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Email</div>
              <div className="text-sm font-medium text-slate-200">{user?.email ?? '—'}</div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Profile;
