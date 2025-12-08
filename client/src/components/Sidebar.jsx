import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { DashboardIcon, DevicesIcon, PoolsIcon, WorkersIcon, SettingsIcon, AlertsIcon, MaintenanceIcon, ChevronLeftIcon, ChevronRightIcon } from '../svg/icons';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  // Не показываем Sidebar, если пользователь не авторизован
  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      path: '/dashboard',
      label: t('sidebar.dashboard'),
      icon: DashboardIcon,
    },
    {
      path: '/devices',
      label: t('sidebar.devices'),
      icon: DevicesIcon,
    },
    {
      path: '/pools',
      label: t('sidebar.pools'),
      icon: PoolsIcon,
    },
    {
      path: '/workers',
      label: t('sidebar.workers'),
      icon: WorkersIcon,
    },
    {
      path: '/alerts',
      label: t('sidebar.alerts'),
      icon: AlertsIcon,
    },
    {
      path: '/maintenance',
      label: t('sidebar.maintenance'),
      icon: MaintenanceIcon,
    },
    {
      path: '/settings',
      label: t('sidebar.settings'),
      icon: SettingsIcon,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-base-200 text-primary border-r border-accent z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-primary
                      ${isCollapsed ? 'justify-center' : ''}
                      ${active
                        ? 'bg-secondary text-accent-content font-semibold'
                        : 'text-primary hover:bg-base-300'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? 'text-accent-content' : ''}`}
                    />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

