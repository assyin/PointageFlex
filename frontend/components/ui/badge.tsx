import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'shift-matin' | 'shift-soir' | 'shift-nuit' | 'default';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      success: 'bg-success text-white',
      warning: 'bg-warning text-white',
      danger: 'bg-danger text-white',
      info: 'bg-info text-white',
      'shift-matin': 'bg-shift-matin text-white',
      'shift-soir': 'bg-shift-soir text-white',
      'shift-nuit': 'bg-shift-nuit text-white',
      default: 'bg-gray-200 text-text-primary',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
