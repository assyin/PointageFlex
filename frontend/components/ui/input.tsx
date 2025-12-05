import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full px-3 py-2.5 bg-input-DEFAULT border border-input-border rounded-input',
          'text-text-primary placeholder:text-input-placeholder',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
