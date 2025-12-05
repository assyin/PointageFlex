import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'w-full px-3 py-2.5 bg-input-DEFAULT border border-input-border rounded-input',
          'text-text-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export { Select };
