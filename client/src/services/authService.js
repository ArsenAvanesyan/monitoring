import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Для работы с cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена в заголовки
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('accessToken');
      // Не перенаправляем, если мы уже на странице логина
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Регистрация
  signUp: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Авторизация
  signIn: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },

  // Выход
  logout: async () => {
    const response = await api.delete('/auth/logout');
    return response.data;
  },

  // Обновление токена
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Получение текущего пользователя
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Обновление профиля
  updateProfile: async (data) => {
    const response = await api.put('/users/', data);
    return response.data;
  },

  // Обновление аватара
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default authService;

