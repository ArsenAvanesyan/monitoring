import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const Profile = () => {
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
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setLoading(true);
    setError('');
    setImageError(false); // Сбрасываем ошибку изображения
    try {
      await updateAvatar(file);
      setSuccess('Фото успешно обновлено');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки фото');
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
      setSuccess(response.message || 'Токен успешно обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Обрабатываем разные типы ошибок
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка обновления токена';
      setError(errorMessage);

      // Если ошибка 429 (слишком много запросов), показываем более понятное сообщение
      if (err.response?.status === 429) {
        setError(errorMessage);
      } else if (err.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
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
        setError('Для смены пароля необходимо указать старый пароль');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }

      if (formData.password.length < 6) {
        setError('Пароль должен быть не менее 6 символов');
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
      setSuccess('Профиль успешно обновлен');
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
      setError(err.message || 'Ошибка обновления профиля');
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
        <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
        <p className="text-base-content/70 mb-8">Управление настройками аккаунта</p>

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
                <p className="text-base-content/70">{user.email}</p>
              </div>
            </div>

            <div className="divider"></div>

            {/* Token Section */}
            <div className="mb-6">
              <label className="label">
                <span className="label-text font-semibold">Токен</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={user.token || ''}
                  className="input input-bordered w-full bg-base-100 font-mono text-sm"
                  readOnly
                />
                <button
                  type="button"
                  className={`btn btn-info ${loading ? 'loading' : ''}`}
                  onClick={handleRefreshToken}
                  disabled={loading}
                >
                  Refresh Token
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Токен можно обновить только раз в сутки
                </span>
              </label>
            </div>

            <div className="divider"></div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Логин</span>
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
                    <span className="label-text font-semibold">Email</span>
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
                        <span className="label-text font-semibold">Старый пароль</span>
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        placeholder="Введите старый пароль для смены"
                        className="input input-info input-bordered w-full bg-base-100"
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Новый пароль</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Оставьте пустым, чтобы не менять"
                        className="input input-info input-bordered w-full bg-base-100"
                        disabled={!isEditing}
                      />
                    </div>

                    {formData.password && (
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">Подтвердите новый пароль</span>
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
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать профиль
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className={`btn btn-info ${loading ? 'loading' : ''}`}
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить'}
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
                      Отмена
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-error ml-auto"
                  onClick={handleLogout}
                >
                  Выйти из аккаунта
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
