import React from 'react';
import PageHeader from '../components/PageHeader';

const Settings: React.FC = () => (
  <div>
    <PageHeader title="Settings" />
    <div className="p-4 bg-gray-800 rounded">Application preferences go here.</div>
  </div>
);

export default Settings;
