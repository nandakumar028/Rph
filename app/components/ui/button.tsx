import React from 'react';
import { cn } from '@/app/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          
          // Variants
          variant === 'primary' && "bg-white text-black hover:bg-neutral-200 border border-white",
          variant === 'secondary' && "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800",
          variant === 'outline' && "bg-transparent text-white border border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700",
          variant === 'ghost' && "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-900",
          variant === 'danger' && "bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/30 hover:border-red-800",

          // Sizes
          size === 'sm' && "px-3 py-1.5 text-xs",
          size === 'md' && "px-4 py-2 text-sm",
          size === 'lg' && "px-5 py-2.5 text-base",
          size === 'icon' && "h-9 w-9 p-0",

          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
