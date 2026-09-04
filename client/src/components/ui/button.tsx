import React from 'react';
import cn from 'classnames';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'icon';
  size?: 'sm' | 'md';
  loading?: boolean;
};

const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 disabled:cursor-not-allowed disabled:opacity-50';
  const sizes: Record<string, string> = {
    sm: variant === 'icon' ? 'h-8 w-8' : 'px-3 py-1.5 text-xs',
    md: variant === 'icon' ? 'h-9 w-9' : 'px-4 py-2.5 text-sm'
  };
  const variants: Record<string, string> = {
    primary: 'bg-brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95',
    secondary: 'border border-line bg-surface text-fg hover:bg-surface-hover',
    outline: 'border border-line bg-transparent text-fg hover:bg-surface-hover',
    ghost: 'bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg',
    danger: 'bg-negative/12 text-negative hover:bg-negative/18',
    icon: 'bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg'
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
};

export default Button;
