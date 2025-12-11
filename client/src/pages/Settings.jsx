import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Settings = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    autoRefresh: true,
    refreshInterval: 30,
    theme: 'auto',
    historyRetentionPeriod: 'half-year',
  });

  // Загружаем настройки пользователя при монтировании компонента
  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        historyRetentionPeriod: user.historyRetentionPeriod || 'half-year',
      }));
    }
  }, [user]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Сохраняем настройку historyRetentionPeriod через updateProfile
      await updateProfile({
        historyRetentionPeriod: settings.historyRetentionPeriod,
      });
      setSuccess(t('settings.saveSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-primary">
        <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-primary/70 mb-8">{t('settings.subtitle')}</p>

        <div className="space-y-6">
          {/* Уведомления */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">{t('settings.notifications')}</h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('settings.enableNotifications')}</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.notifications}
                      onChange={(e) => handleChange('notifications', e.target.checked)}
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('settings.emailAlerts')}</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.emailAlerts}
                      onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Обновление данных */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">{t('settings.dataRefresh')}</h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{t('settings.autoRefresh')}</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.autoRefresh}
                      onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                    />
                  </label>
                </div>
                {settings.autoRefresh && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">{t('settings.refreshInterval')}</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full bg-base-100"
                      value={settings.refreshInterval}
                      onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                      min="5"
                      max="300"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* История данных */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">{t('settings.historyRecording')}</h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('settings.historyRetentionPeriod')}</span>
                </label>
                <select
                  className="select select-bordered w-full bg-base-100"
                  value={settings.historyRetentionPeriod}
                  onChange={(e) => handleChange('historyRetentionPeriod', e.target.value)}
                >
                  <option value="year">{t('settings.retentionYear')}</option>
                  <option value="half-year">{t('settings.retentionHalfYear')}</option>
                  <option value="3months">{t('settings.retention3Months')}</option>
                  <option value="1month">{t('settings.retention1Month')}</option>
                </select>
                <label className="label">
                  <span className="label-text-alt text-primary/70">
                    {t('settings.historyRetentionDescription')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Внешний вид */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">{t('settings.appearance')}</h2>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('settings.theme')}</span>
                </label>
                <select
                  className="select select-bordered w-full bg-base-100"
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <option value="auto">{t('settings.themeAuto')}</option>
                  <option value="light">{t('settings.themeLight')}</option>
                  <option value="dark">{t('settings.themeDark')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Сообщения об ошибках и успехе */}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>{success}</span>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost">{t('common.cancel')}</button>
            <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleSave} disabled={loading}>
              {t('settings.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
