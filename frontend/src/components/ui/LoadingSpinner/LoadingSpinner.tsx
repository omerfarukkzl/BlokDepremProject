import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      white: 'text-white',
      gray: 'text-gray-600',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  showLabel?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size,
  color,
  label,
  showLabel = false,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label={label || 'Loading...'}
      {...props}
    >
      <svg
        className={cn(spinnerVariants({ size, color }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {showLabel && label && (
        <span className="ml-2 text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;