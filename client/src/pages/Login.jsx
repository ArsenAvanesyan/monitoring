import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signIn, isAuthenticated, loading: authLoading } = useAuth();
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

    // Валидация email
    const validateEmailField = (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Поле не должно быть пустым';
        }
        if (!validateEmail(trimmed)) {
            return 'Некорректный формат email';
        }
        return null;
    };

    // Валидация пароля
    const validatePasswordField = (value) => {
        if (!value) {
            return 'Поле не должно быть пустым';
        }
        return null;
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

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Ошибка авторизации. Проверьте email и пароль.');
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
                    <h2 className="card-title text-3xl mb-2">Вход</h2>
                    <p className="text-base-content/70 mb-6">Войдите в свой аккаунт</p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Email</span>
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
                                <span className="label-text font-semibold">Пароль</span>
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

                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Вход...' : 'Войти'}
                            </button>
                        </div>
                    </form>

                    <div className="divider">или</div>

                    <p className="text-center text-sm text-base-content/70">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="link link-primary font-semibold">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

