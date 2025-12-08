import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchIcon, BellIcon, SunIcon, MoonIcon, UserIcon } from '../svg/icons';
import { loadTheme } from '../utils/themeLoader';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';
import NotificationsModal from './NotificationsModal';

const Header = ({ isSidebarCollapsed }) => {
    const { user, isAuthenticated } = useAuth();
    
    // Не показываем Header, если пользователь не авторизован
    if (!isAuthenticated) {
        return null;
    }
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificationCount] = useState(3); // Можно заменить на реальные данные
    const [imageError, setImageError] = useState(false);
    const [theme, setTheme] = useState(() => {
        // Получаем сохраненную тему из localStorage или используем первую по умолчанию
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            return saved || 'monDark';
        }
        return 'monDark';
    });

    // Применяем тему при загрузке и изменении
    useEffect(() => {
        loadTheme(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Сбрасываем ошибку изображения при обновлении пользователя
    useEffect(() => {
        if (user) {
            setImageError(false);
        }
    }, [user]);

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            return prevTheme === 'monDark' ? 'monLight' : 'monDark';
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Здесь можно добавить логику поиска
        console.log('Searching for:', searchQuery);
    };

    return (
        <>
            <header 
                className="fixed top-0 bg-base-300 border-b border-accent px-6 py-4 z-30 transition-all duration-300 right-0" 
                style={{ 
                    left: isSidebarCollapsed ? '80px' : '256px'
                }}
            >
                <div className="flex items-center justify-between gap-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-primary" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered rounded-lg w-full pl-6 bg-base-100 border-base-300 focus:border-primary text-primary"
                            />
                        </div>
                    </form>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="btn btn-ghost btn-circle relative"
                                aria-label="Notifications"
                            >
                                <BellIcon className="w-5 h-5 text-primary" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-error text-error-content rounded-full text-xs flex items-center justify-center">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => {
                                const newLang = i18n.language === 'ru' ? 'en' : 'ru';
                                i18n.changeLanguage(newLang);
                                localStorage.setItem('language', newLang);
                            }}
                            className="btn btn-ghost btn-circle"
                            aria-label="Toggle language"
                        >
                            <span className="text-xl text-primary">
                                {i18n.language === 'ru' ? 'RU' : 'EN'}
                            </span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-ghost btn-circle text-primary"
                            aria-label="Toggle theme"
                        >
                            {theme === 'monDark' ? (
                                <SunIcon className="w-5 h-5" />
                            ) : (
                                <MoonIcon className="w-5 h-5" />
                            )}
                        </button>

                        {/* User Profile */}
                        {user && (
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-300 transition-colors text-primary"
                            >
                                {user.photo && !imageError ? (
                                    <div className="avatar">
                                        <div className="w-10 rounded-full">
                                            <img
                                                src={getImageUrl(user.photo)}
                                                alt={user.login}
                                                onError={() => {
                                                    console.error('Failed to load image:', user.photo);
                                                    setImageError(true);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="avatar placeholder">
                                        <div className="bg-primary text-primary-content rounded-full w-10">
                                            <span className="text-sm font-semibold">
                                                {user.login ? user.login.substring(0, 2).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <span className="hidden md:block font-medium">{user.login || t('common.user')}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Notifications Modal */}
            <NotificationsModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </>
    );
};

export default Header;

