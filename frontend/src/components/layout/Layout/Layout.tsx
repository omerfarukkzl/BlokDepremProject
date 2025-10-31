import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { useAuthStore } from '../../../stores';
import { cn } from '../../../utils/cn';

export interface LayoutProps {
  showHeader?: boolean;
  showSidebar?: boolean;
  headerTitle?: string;
  className?: string;
  contentClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({
  showHeader = true,
  showSidebar = true,
  headerTitle,
  className,
  contentClassName,
}) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className={cn('flex flex-col min-h-screen', className)}>
      {showHeader && <Header title={headerTitle} />}

      <div className="flex flex-1">
        {showSidebar && isAuthenticated && <Sidebar />}

        <main className={cn('flex-1', contentClassName)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;