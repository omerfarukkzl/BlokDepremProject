import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const errorMessageVariants = cva(
  'rounded-md border p-4',
  {
    variants: {
      variant: {
        default: 'border-red-200 bg-red-50 text-red-800',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        info: 'border-blue-200 bg-blue-50 text-blue-800',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorMessageVariants> {
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  showIcon?: boolean;
  actions?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  dismissible = false,
  onDismiss,
  showIcon = true,
  actions,
  variant,
  size,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(errorMessageVariants({ variant, size }), className)}
      role="alert"
      {...props}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon
              className={cn(
                'h-5 w-5',
                variant === 'default' ? 'text-red-400' :
                variant === 'warning' ? 'text-yellow-400' :
                'text-blue-400'
              )}
              aria-hidden="true"
            />
          </div>
        )}

        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title && 'mt-2')}>
            {message}
          </div>
          {actions && (
            <div className="mt-4">
              {actions}
            </div>
          )}
        </div>

        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variant === 'default' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' :
                  variant === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' :
                  'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;