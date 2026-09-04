import React from 'react';
import cn from 'classnames';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...rest }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'mm-field min-h-[96px] resize-y',
      invalid && 'border-negative/50 focus:border-negative focus:ring-negative/20',
      className
    )}
    {...rest}
  />
));

Textarea.displayName = 'Textarea';

export default Textarea;
