import React from 'react';
import cn from 'classnames';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, invalid, children, ...rest }, ref) => (
  <select
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'mm-field',
      invalid && 'border-negative/50 focus:border-negative focus:ring-negative/20',
      className
    )}
    {...rest}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

export default Select;
