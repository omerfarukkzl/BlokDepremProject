import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../ui';
import { LanguageToggle } from '../../ui';
import { useAuthStore } from '../../../stores';
import { useUIStore } from '../../../stores';
import { ROUTES } from '../../../constants';

export interface HeaderProps {
  title?: string;
  showSidebarToggle?: boolean;
  showUserMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'BlokDeprem',
  showSidebarToggle = true,
  showUserMenu = true,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const navigation = [
    { name: t('navigation.home'), href: ROUTES.HOME, icon: HomeIcon, current: false },
    { name: t('navigation.needs'), href: ROUTES.NEEDS, icon: CubeIcon, current: false },
    ...(user?.role === 'official'
      ? [
          { name: t('navigation.shipments'), href: ROUTES.OFFICIAL.SHIPMENTS, icon: CubeIcon, current: false },
          { name: t('navigation.dashboard'), href: ROUTES.OFFICIAL.DASHBOARD, icon: ChartBarIcon, current: false },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          { name: t('navigation.admin'), href: ROUTES.ADMIN.DASHBOARD, icon: CogIcon, current: false },
        ]
      : []),
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {showSidebarToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="mr-4 lg:hidden"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </Button>
            )}

            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 text-sm font-medium',
                    item.current
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LanguageToggle size="sm" />

            {/* User Menu */}
            {showUserMenu && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                >
                  {t('common.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  {t('common.login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(ROUTES.REGISTER)}
                >
                  {t('common.register')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={cn(
                'block w-full text-left pl-3 pr-4 py-2 rounded-md text-base font-medium',
                item.current
                  ? 'text-primary-600 bg-primary-50 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default Header;