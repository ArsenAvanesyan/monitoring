import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signUp, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Функция валидации email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация логина
  const validateLogin = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return t('auth.register.validation.fieldEmpty');
    }
    if (value.includes(' ')) {
      return t('auth.register.validation.loginNoSpaces');
    }
    return null;
  };

  // Валидация email
  const validateEmailField = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return t('auth.register.validation.fieldEmpty');
    }
    if (!validateEmail(trimmed)) {
      return t('auth.register.validation.emailInvalid');
    }
    return null;
  };

  // Валидация пароля
  const validatePassword = (value) => {
    if (!value) {
      return t('auth.register.validation.fieldEmpty');
    }
    if (value.length < 6) {
      return t('auth.register.validation.passwordMin');
    }
    return null;
  };

  // Валидация подтверждения пароля
  const validateConfirmPassword = (value, passwordValue) => {
    if (!value) {
      return t('auth.register.validation.fieldEmpty');
    }
    if (passwordValue && value !== passwordValue) {
      return t('auth.register.validation.passwordsNotMatch');
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = {};

    // Валидация всех полей
    const loginError = validateLogin(login);
    if (loginError) errors.login = loginError;

    const emailError = validateEmailField(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    // Если есть ошибки, показываем их и не отправляем форму
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await signUp(login, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('auth.register.error'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4 text-primary">
      <div className="card bg-base-200 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-3xl mb-2">{t('auth.register.title')}</h2>
          <p className="text-primary/70 mb-6">{t('auth.register.subtitle')}</p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('auth.register.login')}</span>
              </label>
              <input
                type="text"
                placeholder="username"
                className={`input input-bordered w-full bg-base-100 ${fieldErrors.login ? 'input-warning' : ''}`}
                value={login}
                onChange={(e) => {
                  const value = e.target.value;
                  setLogin(value);
                  // Валидируем в реальном времени, если уже есть ошибка
                  if (fieldErrors.login) {
                    const error = validateLogin(value);
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.login = error;
                      } else {
                        delete newErrors.login;
                      }
                      return newErrors;
                    });
                  }
                }}
              />
              {fieldErrors.login && (
                <label className="label">
                  <span className="label-text-alt text-warning">{fieldErrors.login}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('auth.register.email')}</span>
              </label>
              <input
                type="text"
                placeholder="your@email.com"
                className={`input input-bordered w-full bg-base-100 ${fieldErrors.email ? 'input-warning' : ''}`}
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  // Валидируем в реальном времени, если уже есть ошибка
                  if (fieldErrors.email) {
                    const error = validateEmailField(value);
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.email = error;
                      } else {
                        delete newErrors.email;
                      }
                      return newErrors;
                    });
                  }
                }}
              />
              {fieldErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-warning">{fieldErrors.email}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">{t('auth.register.password')}</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`input input-bordered w-full bg-base-100 ${fieldErrors.password ? 'input-warning' : ''}`}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  // Валидируем в реальном времени, если уже есть ошибка
                  if (fieldErrors.password) {
                    const error = validatePassword(value);
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.password = error;
                      } else {
                        delete newErrors.password;
                      }
                      return newErrors;
                    });
                  }
                  // Также проверяем подтверждение пароля, если оно заполнено
                  if (confirmPassword && fieldErrors.confirmPassword) {
                    const confirmError = validateConfirmPassword(confirmPassword, value);
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      if (confirmError) {
                        newErrors.confirmPassword = confirmError;
                      } else {
                        delete newErrors.confirmPassword;
                      }
                      return newErrors;
                    });
                  }
                }}
              />
              {fieldErrors.password && (
                <label className="label">
                  <span className="label-text-alt text-warning">{fieldErrors.password}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  {t('auth.register.confirmPassword')}
                </span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`input input-bordered w-full bg-base-100 ${fieldErrors.confirmPassword ? 'input-warning' : ''}`}
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);
                  // Валидируем в реальном времени, если уже есть ошибка
                  if (fieldErrors.confirmPassword) {
                    const error = validateConfirmPassword(value, password);
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.confirmPassword = error;
                      } else {
                        delete newErrors.confirmPassword;
                      }
                      return newErrors;
                    });
                  }
                }}
              />
              {fieldErrors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-warning">{fieldErrors.confirmPassword}</span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? t('auth.register.submitting') : t('auth.register.submit')}
              </button>
            </div>
          </form>

          <div className="divider">{t('common.or')}</div>

          <p className="text-center text-sm text-primary/70">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="link link-primary font-semibold">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
