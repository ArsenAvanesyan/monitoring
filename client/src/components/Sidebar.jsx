import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardIcon, DevicesIcon, PoolsIcon, WorkersIcon, SettingsIcon } from '../svg/icons';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
    },
    {
      path: '/devices',
      label: 'Devices',
      icon: DevicesIcon,
    },
    {
      path: '/pools',
      label: 'Pools',
      icon: PoolsIcon,
    },
    {
      path: '/workers',
      label: 'Workers',
      icon: WorkersIcon,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 min-h-screen bg-base-200 text-base-content border-r border-accent">
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
                        : 'text-base-content hover:bg-base-300'
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

