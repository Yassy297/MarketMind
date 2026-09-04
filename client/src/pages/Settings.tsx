import React from 'react';
import { Shield, Bell, Palette, KeyRound, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardCard from '../components/DashboardCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { AppearancePreference } from '../config/appearance';

const planned = [
  { icon: Shield, label: 'Security', description: 'Password and two-factor authentication are not available yet.' },
  { icon: Bell, label: 'Notifications', description: 'Notification preferences are not available yet.' },
  { icon: KeyRound, label: 'API Keys', description: 'Integration credentials are not available yet.' }
];

const appearanceOptions: Array<{ value: AppearancePreference; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { appearance, setAppearance } = useTheme();
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mm-page">
      <PageHeader title="Settings" subtitle="Manage your account and workspace appearance." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardCard>
          <h3 className="text-card-title text-fg">Profile</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <div className="font-medium text-fg">{user?.name ?? 'Guest'}</div>
              <div className="text-sm text-fg-muted">{user?.email ?? ''}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-fg-muted">
            Profile editing isn't available yet — reach out to support if you need to update your account details.
          </p>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
              <Palette className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-card-title text-fg">Appearance</h3>
              <p className="mt-1 text-sm text-fg-secondary">Choose how MarketMind looks.</p>
            </div>
          </div>
          <div className="mt-5">
            <SegmentedControl
              name="appearance"
              legend="Appearance"
              value={appearance}
              options={appearanceOptions}
              onChange={setAppearance}
            />
            <p className="mt-3 text-xs text-fg-muted">
              System follows your device setting. This preference is saved to your account and does not change market or currency data.
            </p>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard variant="secondary">
        <h3 className="text-card-title text-fg">Other preferences</h3>
        <div className="mt-4 space-y-1">
          {planned.map((section) => (
            <div key={section.label} className="flex items-center gap-3 rounded-xl px-2 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-fg-muted">
                <section.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-fg">{section.label}</div>
                <div className="text-xs text-fg-muted">{section.description}</div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard className="border-negative/20 bg-negative/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-negative/12 text-negative">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-negative">Danger zone</div>
            <div className="text-xs text-fg-muted">Account deletion isn't available yet.</div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Settings;
