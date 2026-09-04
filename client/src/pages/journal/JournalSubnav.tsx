import { NavLink } from 'react-router-dom';

const links = [
  { to: '/journal', label: 'Overview', end: true },
  { to: '/journal/trades', label: 'Trades', end: true },
  { to: '/journal/calendar', label: 'Calendar', end: true },
  { to: '/journal/reports', label: 'Reports', end: true },
  { to: '/journal/trades/new', label: 'Add Trade', end: true }
];

const JournalSubnav = () => (
  <div className="flex flex-wrap gap-2">
    {links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) =>
          `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            isActive
              ? 'bg-brand-subtle text-brand ring-1 ring-inset ring-brand/30'
              : 'text-fg-secondary hover:bg-surface-hover hover:text-fg'
          }`
        }
      >
        {link.label}
      </NavLink>
    ))}
  </div>
);

export default JournalSubnav;
