import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...rest }) => (
  <button {...rest} className={`px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 ${className}`}>
    {children}
  </button>
);

export default Button;
