import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-button font-semibold transition-all duration-200 hover:shadow-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      secondary: 'bg-secondary text-white hover:bg-secondary-hover',
      success: 'bg-success text-white hover:bg-success-hover',
      warning: 'bg-warning text-white hover:bg-warning-hover',
      danger: 'bg-danger text-white hover:bg-danger-hover',
      outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
