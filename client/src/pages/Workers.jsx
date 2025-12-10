import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Workers = () => {
  const { t } = useTranslation();
  const [workers] = useState([]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto text-primary">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('workers.title')}</h1>
            <p className="text-primary/70">{t('workers.subtitle')}</p>
          </div>
          <button className="btn btn-primary">{t('workers.addWorker')}</button>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {workers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary/70 mb-4">{t('workers.noWorkers')}</p>
                <button className="btn btn-primary btn-sm">{t('workers.addFirstWorker')}</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>{t('workers.workerName')}</th>
                      <th>{t('workers.pools')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('devices.hashrate')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id}>
                        <td className="font-mono">{worker.name}</td>
                        <td>{worker.pools?.join(', ') || '-'}</td>
                        <td>
                          <span className="badge badge-success">{t('common.activeStatus')}</span>
                        </td>
                        <td>{worker.hashrate || '0 MH/s'}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-ghost">{t('common.edit')}</button>
                            <button className="btn btn-sm btn-error">{t('common.delete')}</button>
                          </div>
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

export default Workers;
