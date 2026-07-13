import React from 'react';
import cn from 'classnames';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, ...rest }: InputProps) => (
  <input
    className={cn(
      'w-full rounded-lg bg-ink-900/80 border border-white/8 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20',
      className
    )}
    {...rest}
  />
);

export default Input;
