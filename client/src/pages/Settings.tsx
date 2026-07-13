import React from 'react';
import { Shield, Bell, Palette, KeyRound, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../context/AuthContext';

const sections = [
  { icon: Shield, label: 'Security', description: 'Password and two-factor authentication.' },
  { icon: Bell, label: 'Notifications', description: 'Choose what updates you receive.' },
  { icon: Palette, label: 'Appearance', description: 'Theme and display preferences.' },
  { icon: KeyRound, label: 'API Keys', description: 'Manage integration credentials.' }
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardCard>
          <h3 className="font-semibold text-white">Profile</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <div className="font-medium text-white">{user?.name ?? 'Guest'}</div>
              <div className="text-sm text-slate-500">{user?.email ?? ''}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Profile editing isn't available yet - reach out to support if you need to update your account details.
          </p>
        </DashboardCard>

        <DashboardCard>
          <h3 className="font-semibold text-white">Preferences</h3>
          <div className="mt-4 space-y-1">
            {sections.map((section) => (
              <div key={section.label} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.03]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                  <section.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{section.label}</div>
                  <div className="text-xs text-slate-500">{section.description}</div>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard className="border-rose-500/20 bg-rose-500/[0.03]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-rose-200">Danger Zone</div>
            <div className="text-xs text-slate-500">Account deletion isn't available yet.</div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Settings;
