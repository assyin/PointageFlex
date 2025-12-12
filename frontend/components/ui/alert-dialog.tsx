'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined);

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open = false, onOpenChange, children }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [isControlled, onOpenChange]
  );

  React.useEffect(() => {
    if (isControlled) {
      setInternalOpen(open);
    }
  }, [open, isControlled]);

  return (
    <AlertDialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function AlertDialogTrigger({
  asChild,
  onClick,
  children,
  ...props
}: AlertDialogTriggerProps) {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialogTrigger must be used within an AlertDialog component');
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.onOpenChange(true);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    } as any);
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    if (!context) {
      throw new Error('AlertDialogContent must be used within an AlertDialog component');
    }

    if (!context.open) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-50 bg-black/50 cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            context.onOpenChange(false);
          }}
          aria-hidden="true"
        />
        {/* Alert Dialog */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            ref={ref}
            className={cn(
              'relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg pointer-events-auto',
              className
            )}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            {...props}
          >
            {children}
          </div>
        </div>
      </>
    );
  }
);

AlertDialogContent.displayName = 'AlertDialogContent';

export function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-500', className)} {...props} />;
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      context?.onOpenChange(false);
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

AlertDialogAction.displayName = 'AlertDialogAction';

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      context?.onOpenChange(false);
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

AlertDialogCancel.displayName = 'AlertDialogCancel';
