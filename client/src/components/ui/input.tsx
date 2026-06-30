import React from 'react';
import cn from 'classnames';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, ...rest }: InputProps) => (
  <input className={cn('w-full rounded-md bg-transparent border border-white/6 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500', className)} {...rest} />
);

export default Input;
