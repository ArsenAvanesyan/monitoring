import React from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon } from '../svg/icons';

const NotificationsModal = ({ isOpen, onClose, notifications = [] }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  // Пример уведомлений (можно заменить на реальные данные)
  const defaultNotifications = [
    {
      id: 1,
      title: 'Device Offline',
      message: 'Device ASIC-001 has gone offline',
      time: '5 minutes ago',
      type: 'error',
    },
    {
      id: 2,
      title: 'High Temperature',
      message: 'Device ASIC-045 temperature is above 80°C',
      time: '15 minutes ago',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Pool Connection',
      message: 'Successfully connected to pool stratum+tcp://pool.example.com',
      time: '1 hour ago',
      type: 'success',
    },
  ];

  const displayNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      default:
        return 'text-info';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-4 top-16 w-96 bg-base-200 rounded-lg shadow-xl z-50 border border-base-300 text-primary">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{t('notificationsModal.title')}</h3>
            {displayNotifications.length > 0 && (
              <span className="badge badge-primary badge-sm">
                {displayNotifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            ✕
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {displayNotifications.length === 0 ? (
            <div className="p-8 text-center text-primary/60">
              <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>{t('notificationsModal.noNotifications')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-base-300">
              {displayNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className="p-4 hover:bg-base-300 transition-colors cursor-pointer"
                  onClick={onClose}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)} bg-current`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary">
                        {notification.title}
                      </p>
                      <p className="text-sm text-primary/70 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-primary/50 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {displayNotifications.length > 0 && (
          <div className="p-4 border-t border-base-300">
            <button
              onClick={onClose}
              className="btn btn-primary btn-sm w-full"
            >
              {t('notificationsModal.markAllRead')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsModal;

