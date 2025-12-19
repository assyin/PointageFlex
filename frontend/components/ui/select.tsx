'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Map<string, string>; // Map value to label
  registerItem: (value: string, label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);
  const [items] = React.useState(new Map<string, string>());
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [isControlled, onValueChange]
  );

  const registerItem = React.useCallback((value: string, label: string) => {
    items.set(value, label);
  }, [items]);

  React.useEffect(() => {
    if (isControlled && value !== undefined) {
      setInternalValue(value);
    }
  }, [value, isControlled]);

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        onOpenChange: setOpen,
        items,
        registerItem,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectTrigger must be used within a Select component');
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context.onOpenChange(!context.open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input-border bg-input-DEFAULT px-3 py-2 text-sm text-text-primary',
          'ring-offset-white placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

export function SelectValue({ placeholder, children }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('SelectValue must be used within a Select component');
  }

  if (children) {
    return <span className="flex items-center gap-2">{children}</span>;
  }

  // Find the label for the current value
  const label = context.items.get(context.value);
  
  if (label) {
    return <span className="truncate">{label}</span>;
  }

  if (context.value && context.value !== 'all') {
    return <span className="truncate">{context.value}</span>;
  }

  if (context.value === 'all') {
    return <span className="truncate">Toutes les catégories</span>;
  }

  return <span className="text-gray-400">{placeholder}</span>;
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    if (!context) {
      throw new Error('SelectContent must be used within a Select component');
    }

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (contentRef.current && !contentRef.current.contains(target)) {
          context.onOpenChange(false);
        }
      };

      if (context.open) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [context.open, context]);

    if (!context.open) return null;

    return (
      <>
        {/* Overlay - transparent backdrop to close on outside click */}
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            context.onOpenChange(false);
          }}
          aria-hidden="true"
        />
        {/* Content */}
        <div
          ref={combinedRef}
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-input-border bg-white p-1 text-text-primary shadow-md',
            'top-full mt-1',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectItem must be used within a Select component');
    }

    const isSelected = context.value === value;

    // Register this item's label
    React.useEffect(() => {
      const label = typeof children === 'string' ? children : React.Children.toArray(children).join('');
      context.registerItem(value, label);
    }, [value, children, context]);

    return (
      <div
        ref={ref}
        onClick={() => context.onValueChange(value)}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus:bg-gray-100 focus:text-gray-900',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          isSelected && 'bg-gray-100 text-gray-900 font-medium',
          className
        )}
        data-selected={isSelected}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

// Keep the old Select component for backward compatibility
export interface SelectPropsOld extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const SelectOld = React.forwardRef<HTMLSelectElement, SelectPropsOld>(
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

SelectOld.displayName = 'SelectOld';
