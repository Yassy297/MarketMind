import React from 'react';
import cn from 'classnames';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };

const Button = ({ className, variant = 'primary', children, ...rest }: ButtonProps) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus:outline-none transition';
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-white/3 text-gray-100 border border-white/6'
  };

  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
