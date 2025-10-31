import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  MapPinIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../../stores';
import { useUIStore } from '../../../stores';
import { ROUTES, USER_ROLES } from '../../../constants';
import { cn } from '../../../utils/cn';

export interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const navigation = React.useMemo(() => {
    const baseNav = [
      {
        name: 'Anasayfa',
        href: ROUTES.HOME,
        icon: HomeIcon,
        roles: ['donor', 'official', 'admin'] as const,
      },
      {
        name: 'İhtiyaç Listesi',
        href: ROUTES.NEEDS,
        icon: ClipboardDocumentListIcon,
        roles: ['donor', 'official', 'admin'] as const,
      },
      {
        name: 'Kargo Takip',
        href: ROUTES.TRACK,
        icon: CubeIcon,
        roles: ['donor', 'official', 'admin'] as const,
      },
    ];

    const officialNav = [
      {
        name: 'Dashboard',
        href: ROUTES.OFFICIAL.DASHBOARD,
        icon: ChartBarIcon,
        roles: ['official', 'admin'] as const,
      },
      {
        name: 'Gönderi Yönetimi',
        href: ROUTES.OFFICIAL.SHIPMENTS,
        icon: CubeIcon,
        roles: ['official', 'admin'] as const,
      },
      {
        name: 'İhtiyaç Yönetimi',
        href: '/official/needs',
        icon: ClipboardDocumentListIcon,
        roles: ['official', 'admin'] as const,
      },
    ];

    const adminNav = [
      {
        name: 'Kullanıcı Yönetimi',
        href: ROUTES.ADMIN.USERS,
        icon: UserGroupIcon,
        roles: ['admin'] as const,
      },
      {
        name: 'Lokasyon Yönetimi',
        href: ROUTES.ADMIN.LOCATIONS,
        icon: MapPinIcon,
        roles: ['admin'] as const,
      },
      {
        name: 'Sistem Ayarları',
        href: ROUTES.ADMIN.SETTINGS,
        icon: Cog6ToothIcon,
        roles: ['admin'] as const,
      },
      {
        name: 'Raporlar',
        href: ROUTES.ADMIN.ANALYTICS,
        icon: DocumentTextIcon,
        roles: ['admin'] as const,
      },
    ];

    const allNav = [...baseNav, ...officialNav, ...adminNav];
    return allNav.filter(item => user?.role && item.roles.includes(user.role));
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 px-6 bg-primary-600 text-white">
            <h1 className="text-xl font-bold">BlokDeprem</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          {user && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.role === 'official' ? 'Görevli' :
                     user.role === 'admin' ? 'Yönetici' : 'Yardımsever'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;