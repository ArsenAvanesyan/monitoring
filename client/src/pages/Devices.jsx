import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Devices = () => {
  const { t } = useTranslation();
  const [devices] = useState([]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto text-primary">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('devices.title')}</h1>
            <p className="text-primary/70">{t('devices.subtitle')}</p>
          </div>
          <button className="btn btn-primary">
            {t('devices.addDevice')}
          </button>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {devices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary/70 mb-4">{t('devices.noDevices')}</p>
                <button className="btn btn-primary btn-sm">
                  {t('devices.addFirstDevice')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>{t('common.name')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('devices.hashrate')}</th>
                      <th>{t('devices.temperature')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id}>
                        <td>{device.name}</td>
                        <td>
                          <span className="badge badge-success">{t('common.activeStatus')}</span>
                        </td>
                        <td>{device.hashrate}</td>
                        <td>{device.temperature}°C</td>
                        <td>
                          <button className="btn btn-sm btn-ghost">{t('common.details')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Devices;

