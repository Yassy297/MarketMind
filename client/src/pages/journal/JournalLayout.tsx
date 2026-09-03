import { Outlet } from 'react-router-dom';
import JournalSubnav from './JournalSubnav';

const JournalLayout = () => (
  <div className="space-y-6">
    <JournalSubnav />
    <Outlet />
  </div>
);

export default JournalLayout;
