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

  // Check role requirements - admin has access to all roles (hierarchical)
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    if (!user?.role) return false;

    // Admin can access everything
    if (user.role === 'admin') return true;

    // Official can access official and donor pages
    if (user.role === 'official' && (requiredRole === 'official' || requiredRole === 'donor')) {
      return true;
    }

    // Exact match for other cases
    return user.role === requiredRole;
  };

  if (requiredRole && !hasRequiredRole()) {
    // Redirect based on user role
    let redirectPath: string = ROUTES.HOME;

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