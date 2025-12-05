import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);
    const { signIn, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Получаем CAPCHA_SITE_KEY из переменных окружения
    const recaptchaSiteKey = import.meta.env.VITE_CAPCHA_SITE_KEY || '';

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

    // Валидация email
    const validateEmailField = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return t('auth.login.validation.emailEmpty');
        }
        if (!validateEmail(trimmed)) {
            return t('auth.login.validation.emailInvalid');
        }
        return null;
    };

    // Валидация пароля
    const validatePasswordField = (value) => {
        if (!value) {
            return t('auth.login.validation.emailEmpty');
        }
        return null;
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const errors = {};

        // Валидация всех полей
        const emailError = validateEmailField(email);
        if (emailError) errors.email = emailError;

        const passwordError = validatePasswordField(password);
        if (passwordError) errors.password = passwordError;

        // Проверка reCAPTCHA, если включена
        if (recaptchaSiteKey && !recaptchaToken) {
            setError('Пожалуйста, подтвердите, что вы не робот');
            return;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            await signIn(email, password, recaptchaToken);
            // Сбрасываем reCAPTCHA после успешного входа
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setRecaptchaToken(null);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || t('auth.login.error'));
            // Сбрасываем reCAPTCHA при ошибке
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            setRecaptchaToken(null);
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
                    <h2 className="card-title text-3xl mb-2">{t('auth.login.title')}</h2>
                    <p className="text-primary/70 mb-6">{t('auth.login.subtitle')}</p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">{t('auth.login.email')}</span>
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
                                        setFieldErrors(prev => {
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
                                <span className="label-text font-semibold">{t('auth.login.password')}</span>
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
                                        const error = validatePasswordField(value);
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            if (error) {
                                                newErrors.password = error;
                                            } else {
                                                delete newErrors.password;
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

                        {recaptchaSiteKey && (
                            <div className="form-control">
                                <div className="flex justify-center">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={recaptchaSiteKey}
                                        onChange={handleRecaptchaChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                                disabled={loading || (recaptchaSiteKey && !recaptchaToken)}
                            >
                                {loading ? t('auth.login.submitting') : t('auth.login.submit')}
                            </button>
                        </div>
                    </form>

                    <div className="divider">{t('common.or')}</div>

                    <p className="text-center text-sm text-primary/70">
                        {t('auth.login.noAccount')}{' '}
                        <Link to="/register" className="link link-primary font-semibold">
                            {t('auth.login.register')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

