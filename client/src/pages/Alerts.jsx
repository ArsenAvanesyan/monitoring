import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Alerts = () => {
  const { t } = useTranslation();
  const [alerts] = useState([]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto text-primary">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('alerts.title')}</h1>
            <p className="text-primary/70">{t('alerts.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost">{t('alerts.alertSettings')}</button>
            <button className="btn btn-primary">{t('alerts.createAlert')}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">{t('alerts.active')}</h2>
              <p className="text-3xl font-bold text-warning">0</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">{t('alerts.critical')}</h2>
              <p className="text-3xl font-bold text-error">0</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">{t('alerts.total')}</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary/70 mb-4">{t('alerts.noAlerts')}</p>
                <p className="text-sm text-primary/50">{t('alerts.allSystemsOk')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert ${
                      alert.severity === 'critical'
                        ? 'alert-error'
                        : alert.severity === 'warning'
                          ? 'alert-warning'
                          : 'alert-info'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold">{alert.title}</h3>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button className="btn btn-sm btn-ghost">{t('common.close')}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
