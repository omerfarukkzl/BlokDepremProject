import React, { createContext, useContext, ReactNode } from 'react';
import { ToastContainer } from '../Toast';
import { useUIStore } from '../../../stores';

// Notification context for easy access throughout the app
interface NotificationContextType {
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const { addNotification, clearNotifications } = useUIStore();

  const showSuccess = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: duration || 5000,
    });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 0, // Errors don't auto-dismiss by default
    });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || 7000,
    });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: duration || 5000,
    });
  };

  const contextValue: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} />
    </NotificationContext.Provider>
  );
};

// Hook for using notifications
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;