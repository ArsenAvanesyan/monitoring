import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { DashboardIcon, DevicesIcon, PoolsIcon, WorkersIcon, SettingsIcon, AlertsIcon, MaintenanceIcon } from '../svg/icons';

const Sidebar = () => {
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
    <aside className="w-64 min-h-screen bg-base-200 text-primary border-r border-accent">
      <div className="flex flex-col h-full">
        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
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
                      ${active
                        ? 'bg-secondary text-accent-content font-semibold'
                        : 'text-primary hover:bg-base-300'
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${active ? 'text-accent-content' : ''}`}
                    />
                    <span>{item.label}</span>
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

