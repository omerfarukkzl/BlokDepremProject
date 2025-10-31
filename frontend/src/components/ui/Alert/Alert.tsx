import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';

const alertVariants = cva(
  'rounded-md p-4',
  {
    variants: {
      variant: {
        success: 'bg-green-50 border border-green-200 text-green-800',
        error: 'bg-red-50 border border-red-200 text-red-800',
        warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border border-blue-200 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconVariants = cva('h-5 w-5 flex-shrink-0', {
  variants: {
    variant: {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  dismissible = false,
  onDismiss,
  showIcon = true,
  variant,
  className,
  ...props
}) => {
  const getIcon = () => {
    const IconComponent =
      variant === 'success' ? CheckCircleIcon :
      variant === 'error' ? XCircleIcon :
      variant === 'warning' ? ExclamationTriangleIcon :
      InformationCircleIcon;

    return <IconComponent className={cn(iconVariants({ variant }))} />;
  };

  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        )}

        <div className={cn('ml-3', showIcon && 'ml-3')}>
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}

          {children && (
            <div className={cn('text-sm', title && 'mt-2')}>
              {children}
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
                  variant === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50' :
                  variant === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50' :
                  variant === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50' :
                  'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50'
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

export default Alert;