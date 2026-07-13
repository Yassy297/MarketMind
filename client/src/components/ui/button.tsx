import React from 'react';
import cn from 'classnames';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md';
};

const Button = ({ className, variant = 'primary', size = 'md', children, ...rest }: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50';
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm'
  };
  const variants: Record<string, string> = {
    primary:
      'bg-brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95',
    secondary: 'bg-ink-800 text-slate-100 border border-white/5 hover:bg-ink-700',
    outline: 'bg-transparent border border-white/10 text-slate-200 hover:bg-white/5 hover:border-white/20',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5'
  };

  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
