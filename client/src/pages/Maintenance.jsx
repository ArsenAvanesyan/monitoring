import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Maintenance = () => {
  const { t } = useTranslation();
  const [maintenanceTasks] = useState([]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto text-primary">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('maintenance.title')}</h1>
            <p className="text-primary/70">{t('maintenance.subtitle')}</p>
          </div>
          <button className="btn btn-primary">{t('maintenance.createTask')}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">{t('maintenance.scheduled')}</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">{t('maintenance.inProgress')}</h2>
              <p className="text-3xl font-bold text-warning">0</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">{t('maintenance.completed')}</h2>
              <p className="text-3xl font-bold text-success">0</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            {maintenanceTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary/70 mb-4">{t('maintenance.noTasks')}</p>
                <button className="btn btn-primary btn-sm">
                  {t('maintenance.createFirstTask')}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>{t('maintenance.task')}</th>
                      <th>{t('maintenance.device')}</th>
                      <th>{t('maintenance.date')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceTasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.device}</td>
                        <td>{new Date(task.date).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`badge ${
                              task.status === 'completed'
                                ? 'badge-success'
                                : task.status === 'in-progress'
                                  ? 'badge-warning'
                                  : 'badge-info'
                            }`}
                          >
                            {task.status === 'completed'
                              ? t('maintenance.statusCompleted')
                              : task.status === 'in-progress'
                                ? t('maintenance.statusInProgress')
                                : t('maintenance.statusScheduled')}
                          </span>
                        </td>
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

export default Maintenance;
