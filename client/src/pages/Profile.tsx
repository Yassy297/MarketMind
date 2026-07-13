import React from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" />
      <div className="p-4 bg-gray-800 rounded">
        <div>Name: {user?.name}</div>
        <div>Email: {user?.email}</div>
      </div>
    </div>
  );
};

export default Profile;
