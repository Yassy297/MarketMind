import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
    <div className="text-center">
      <h1 className="text-3xl font-bold">404 — Not Found</h1>
      <p className="mt-4">The page you were looking for does not exist.</p>
      <div className="mt-6">
        <Link to="/" className="px-4 py-2 bg-indigo-600 rounded">Go home</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
