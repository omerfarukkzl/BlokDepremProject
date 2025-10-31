import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../stores';
import { LoadingSpinner } from '../../ui';
import { ROUTES } from '../../../constants';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'official' | 'donor';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = ROUTES.LOGIN,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" showLabel label="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check role requirements
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    let redirectPath = ROUTES.HOME;

    if (user?.role === 'admin') {
      redirectPath = ROUTES.ADMIN.DASHBOARD;
    } else if (user?.role === 'official') {
      redirectPath = ROUTES.OFFICIAL.DASHBOARD;
    }

    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;