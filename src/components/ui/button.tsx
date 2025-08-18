import * as React from 'react';
// import { Slot } from '@radix-ui/react-slot'; // Removed for static export
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'btn-scientific inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-900 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900 shadow-lg hover:shadow-xl',
        destructive: 'bg-gradient-to-r from-danger-600 to-danger-700 text-white hover:from-danger-700 hover:to-danger-800 active:from-danger-800 active:to-danger-900 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-400 text-primary-700 hover:text-primary-800 dark:border-primary-600 dark:bg-gray-800 dark:hover:bg-primary-950 dark:text-primary-300 dark:hover:text-primary-200',
        secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white hover:from-secondary-700 hover:to-secondary-800 active:from-secondary-800 active:to-secondary-900 shadow-lg hover:shadow-xl',
        ghost: 'hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300 transition-colors',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
        success: 'bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800 active:from-success-800 active:to-success-900 shadow-lg hover:shadow-xl',
        warning: 'bg-gradient-to-r from-warning-600 to-warning-700 text-white hover:from-warning-700 hover:to-warning-800 active:from-warning-800 active:to-warning-900 shadow-lg hover:shadow-xl',
        scientific: 'bg-gradient-to-r from-lab-primary to-lab-secondary text-white hover:shadow-glow transition-all duration-300 shadow-lg',
        precision: 'bg-white border-2 border-precision-high text-precision-high hover:bg-precision-high hover:text-white transition-all duration-200',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-lg px-10 text-lg font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    // For static export, disable asChild to avoid React.Children.only issues
    if (asChild) {
      // Return a simple button that looks like the child but acts as a button
      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {loading && (
            <div className="mr-2 rtl:ml-2 rtl:mr-0">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
          {children}
        </button>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 rtl:ml-2 rtl:mr-0">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
