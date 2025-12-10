import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile, updateAvatar, logout, refreshUserToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    login: '',
    email: '',
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        login: user.login || '',
        email: user.email || '',
        oldPassword: '',
        password: '',
        confirmPassword: '',
      });
      // Сбрасываем ошибку изображения при обновлении пользователя
      setImageError(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('profile.errors.selectImage'));
      return;
    }

    setLoading(true);
    setError('');
    setImageError(false); // Сбрасываем ошибку изображения
    try {
      await updateAvatar(file);
      setSuccess(t('profile.errors.avatarSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('profile.errors.avatarError'));
    } finally {
      setLoading(false);
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRefreshToken = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await refreshUserToken();
      setSuccess(response.message || t('profile.errors.tokenSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Обрабатываем разные типы ошибок
      const errorMessage =
        err.response?.data?.message || err.message || t('profile.errors.tokenError');
      setError(errorMessage);

      // Если ошибка 429 (слишком много запросов), показываем более понятное сообщение
      if (err.response?.status === 429) {
        setError(errorMessage);
      } else if (err.response?.status === 401) {
        setError(t('profile.errors.sessionExpired'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация пароля
    if (formData.password) {
      if (!formData.oldPassword) {
        setError(t('profile.errors.oldPasswordRequired'));
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(t('profile.errors.passwordsNotMatch'));
        return;
      }

      if (formData.password.length < 6) {
        setError(t('profile.errors.passwordMin'));
        return;
      }
    }

    setLoading(true);

    try {
      const updateData = {
        login: formData.login,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.oldPassword = formData.oldPassword;
      }

      await updateProfile(updateData);
      setSuccess(t('profile.success.profileUpdated'));
      setIsEditing(false);
      setFormData({
        login: user.login || '',
        email: user.email || '',
        oldPassword: '',
        password: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('profile.errors.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  const avatarInitials = user.login ? user.login.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-primary">
        <h1 className="text-3xl font-bold mb-2">{t('profile.title')}</h1>
        <p className="text-primary/70 mb-8">{t('profile.subtitle')}</p>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex items-center gap-6 mb-6">
              <div
                className={`avatar ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={handleAvatarClick}
                title={isEditing ? 'Нажмите, чтобы изменить фото' : ''}
              >
                {user.photo && !imageError ? (
                  <div className="w-24 rounded-full">
                    <img
                      src={getImageUrl(user.photo)}
                      alt={user.login}
                      onError={() => {
                        console.error('Failed to load image:', user.photo);
                        setImageError(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-primary text-primary-content rounded-full w-24">
                    <span className="text-3xl font-semibold">{avatarInitials}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div>
                <h2 className="text-2xl font-bold">{user.login}</h2>
                <p className="text-primary/70">{user.email}</p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Token Section */}
            <div className="mb-6">
              <label className="label">
                <span className="label-text font-semibold">Токен для access.exe</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  id="accessToken"
                  value={user.token || 'Токен не сгенерирован'}
                  className="input input-bordered w-full bg-base-100 font-mono text-sm"
                  readOnly
                />
                {user.token && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      navigator.clipboard.writeText(user.token);
                      setSuccess('Токен скопирован в буфер обмена!');
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    title="Копировать токен"
                  >
                    📋
                  </button>
                )}
                <button
                  type="button"
                  className={`btn btn-info ${loading ? 'loading' : ''}`}
                  onClick={handleRefreshToken}
                  disabled={loading}
                >
                  {t('profile.refreshToken')}
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-primary/50">
                  Используйте этот токен в access.exe. Добавьте его в заголовок Authorization или в
                  query параметр ?token=YOUR_TOKEN
                </span>
              </label>
              {!user.token && (
                <div className="alert alert-warning mt-2">
                  <span>⚠️ У вас нет токена. Нажмите "Обновить токен" для генерации.</span>
                </div>
              )}
            </div>

            <div className="divider"></div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">{t('profile.login')}</span>
                  </label>
                  <input
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    className="input input-info input-bordered w-full bg-base-100"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">{t('profile.email')}</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-info input-bordered w-full bg-base-100"
                    disabled={!isEditing}
                    required
                  />
                </div>

                {isEditing && (
                  <>
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">{t('profile.oldPassword')}</span>
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        placeholder={t('profile.oldPasswordPlaceholder')}
                        className="input input-info input-bordered w-full bg-base-100"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">{t('profile.newPassword')}</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('profile.newPasswordPlaceholder')}
                        className="input input-info input-bordered w-full bg-base-100"
                        disabled={!isEditing}
                      />
                    </div>

                    {formData.password && (
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">
                            {t('profile.confirmPassword')}
                          </span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="input input-info input-bordered w-full bg-base-100"
                          disabled={!isEditing}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {!isEditing ? (
                  <button type="button" className="btn btn-info" onClick={() => setIsEditing(true)}>
                    {t('profile.editProfile')}
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className={`btn btn-info ${loading ? 'loading' : ''}`}
                      disabled={loading}
                    >
                      {loading ? t('common.loading') : t('common.save')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          login: user.login || '',
                          email: user.email || '',
                          oldPassword: '',
                          password: '',
                          confirmPassword: '',
                        });
                        setError('');
                        setSuccess('');
                      }}
                      disabled={loading}
                    >
                      {t('common.cancel')}
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-error ml-auto" onClick={handleLogout}>
                  {t('profile.logout')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
