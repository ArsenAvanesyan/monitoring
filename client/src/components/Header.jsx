import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, BellIcon, SunIcon, MoonIcon, UserIcon } from '../svg/icons';
import { loadTheme } from '../utils/themeLoader';
import NotificationsModal from './NotificationsModal';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificationCount] = useState(3); // Можно заменить на реальные данные
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
            <header className="bg-base-300 border-b border-accent px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-base-content/50" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search devices, workers, pools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-bordered rounded-lg w-full pl-6 bg-base-100 border-base-300 focus:border-primary"
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
                                <BellIcon className="w-5 h-5" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-error text-error-content rounded-full text-xs flex items-center justify-center">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-ghost btn-circle"
                            aria-label="Toggle theme"
                        >
                            {theme === 'monDark' ? (
                                <SunIcon className="w-5 h-5" />
                            ) : (
                                <MoonIcon className="w-5 h-5" />
                            )}
                        </button>

                        {/* User Profile */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-300 transition-colors"
                        >
                            <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-10">
                                    <span className="text-sm font-semibold">JD</span>
                                </div>
                            </div>
                            <span className="hidden md:block font-medium">John Doe</span>
                        </Link>
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

