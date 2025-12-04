import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../utils/cn';
import { useUIStore } from '../../../stores';
import type { NotificationState } from '../../../types';

const toastVariants = cva(
  'pointer-events-auto w-96 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5',
  {
    variants: {
      variant: {
        success: 'border-l-4 border-green-400',
        error: 'border-l-4 border-red-400',
        warning: 'border-l-4 border-yellow-400',
        info: 'border-l-4 border-blue-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconVariants = cva('h-6 w-6 flex-shrink-0', {
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

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  notification: NotificationState;
  onDismiss?: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  notification,
  onDismiss,
  className,
  ...props
}) => {
  const { removeNotification } = useUIStore();

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = () => {
    removeNotification(notification.id);
    onDismiss?.(notification.id);
  };

  const getIcon = () => {
    const IconComponent =
      notification.type === 'success' ? CheckCircleIcon :
      notification.type === 'error' ? XCircleIcon :
      notification.type === 'warning' ? ExclamationTriangleIcon :
      InformationCircleIcon;

    return <IconComponent className={cn(iconVariants({ variant: notification.type }))} />;
  };

  return (
    <div
      className={cn(toastVariants({ variant: notification.type }), className)}
      {...props}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1 pt-0.5 min-w-0">
            <p className="text-sm font-medium text-gray-900 break-words">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-500 break-words">
                {notification.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={cn(
                'inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
                notification.type === 'success' ? 'focus:ring-green-500' :
                notification.type === 'error' ? 'focus:ring-red-500' :
                notification.type === 'warning' ? 'focus:ring-yellow-500' :
                'focus:ring-blue-500'
              )}
              onClick={handleDismiss}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  className,
  position = 'top-right',
}) => {
  const { notifications } = useUIStore();

  const positionClasses = {
    'top-right': 'fixed top-0 right-1 z-50 p-2 space-y-2',
    'top-left': 'fixed top-0 left-1 z-50 p-2 space-y-2',
    'bottom-right': 'fixed bottom-0 right-1 z-50 p-2 space-y-2',
    'bottom-left': 'fixed bottom-0 left-1 z-50 p-2 space-y-2',
  };

  return (
    <div
      className={cn(
        positionClasses[position],
        'pointer-events-none',
        className
      )}
      aria-live="assertive"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} />
        </div>
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default Toast;