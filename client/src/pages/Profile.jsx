import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, updateAvatar, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        login: user.login || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    try {
      await updateAvatar(file);
      setSuccess('Фото успешно обновлено');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки фото');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        login: formData.login,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateProfile(updateData);
      setSuccess('Профиль успешно обновлен');
      setIsEditing(false);
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
              <div className="avatar">
                {user.photo ? (
                  <div className="w-24 rounded-full">
                    <img src={user.photo} alt={user.login} />
                  </div>
                ) : (
                  <div className="bg-primary text-primary-content rounded-full w-24">
                    <span className="text-3xl font-semibold">{avatarInitials}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.login}</h2>
                <p className="text-base-content/70">{user.email}</p>
              </div>
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

                {isEditing && formData.password && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Подтвердите пароль</span>
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

                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Фото профиля</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-info w-full bg-base-100"
                    disabled={!isEditing || loading}
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50">
                      Загрузите изображение для вашего профиля
                    </span>
                  </label>
                </div>
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
