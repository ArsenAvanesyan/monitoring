import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          setAccessToken(token);
          // Пытаемся получить данные пользователя
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (error) {
            // Если не удалось получить пользователя, очищаем токен
            console.error('Failed to get user:', error);
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Регистрация
  const signUp = async (login, email, password) => {
    try {
      const data = { login, email, password };
      const response = await authService.signUp(data);
      setUser(response.user);
      setAccessToken(response.accessToken);
      localStorage.setItem('accessToken', response.accessToken);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Ошибка регистрации' };
    }
  };

  // Авторизация
  const signIn = async (email, password) => {
    try {
      const response = await authService.signIn(email, password);
      setUser(response.user);
      setAccessToken(response.accessToken);
      localStorage.setItem('accessToken', response.accessToken);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Ошибка авторизации' };
    }
  };

  // Выход
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если запрос не удался, очищаем локальные данные
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  // Обновление профиля
  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Ошибка обновления профиля' };
    }
  };

  // Обновление аватара
  const updateAvatar = async (file) => {
    try {
      const response = await authService.updateAvatar(file);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Ошибка обновления аватара' };
    }
  };

  const value = {
    user,
    loading,
    accessToken,
    signUp,
    signIn,
    logout,
    updateProfile,
    updateAvatar,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

