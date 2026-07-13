import React from 'react';

const Avatar: React.FC<{ name?: string; size?: number }> = ({ name = '?', size = 32 }) => (
  <div className="rounded-full bg-gray-700 flex items-center justify-center" style={{ width: size, height: size }}>
    <span className="text-sm">{name.charAt(0).toUpperCase()}</span>
  </div>
);

export default Avatar;
