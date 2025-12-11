import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Pools = () => {
  const { t } = useTranslation();
  const [pools] = useState([]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto text-primary">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('pools.title')}</h1>
            <p className="text-primary/70">{t('pools.subtitle')}</p>
          </div>
          <button className="btn btn-primary">{t('pools.addPool')}</button>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {pools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary/70 mb-4">{t('pools.noPools')}</p>
                <button className="btn btn-primary btn-sm">{t('pools.addFirstPool')}</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>{t('common.name')}</th>
                      <th>{t('pools.url')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('pools.workers')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pools.map((pool) => (
                      <tr key={pool.id}>
                        <td>{pool.name}</td>
                        <td className="font-mono text-sm">{pool.url}</td>
                        <td>
                          <span className="badge badge-success">{t('common.activeStatus')}</span>
                        </td>
                        <td>{pool.workers}</td>
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

export default Pools;
