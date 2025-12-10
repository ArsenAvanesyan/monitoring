import axios from 'axios';

// На продакшене используем относительный путь /api (проксируется через nginx/Apache)
// В разработке (Vite dev server на 5173) используем localhost:3000
// В Docker (nginx на 8080) используем относительный путь /api
const getApiUrl = () => {
  // Если задана переменная окружения - используем её
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Проверяем port для определения окружения
  const port = window.location.port;

  // Vite dev server обычно на 5173 или 5174 - только для него используем localhost:3000
  if (port === '5173' || port === '5174') {
    return 'http://localhost:3000/api';
  }

  // Во всех остальных случаях (Docker на 8080, production) используем относительный путь
  // Это работает, потому что nginx проксирует /api на backend
  return '/api';
};

const API_URL = getApiUrl();

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

// Interceptor для обработки ошибок авторизации и автоматического обновления токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление access token
    // Исключаем /auth/refresh и /auth/signin, /auth/signup чтобы избежать бесконечного цикла
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/signin') ||
      originalRequest.url?.includes('/auth/signup');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Если токен уже обновляется, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пытаемся обновить access token через refresh token
        // Используем прямой axios запрос без Authorization заголовка, так как refresh token в cookies
        console.log('Attempting to refresh access token...');
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );
        const { accessToken } = response.data;

        if (!accessToken) {
          throw new Error('Access token not received from refresh endpoint');
        }

        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Уведомляем о обновлении токена через событие
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'accessToken',
            newValue: accessToken,
            oldValue: localStorage.getItem('accessToken'),
          })
        );

        processQueue(null, accessToken);
        isRefreshing = false;

        console.log(
          'Access token refreshed successfully, retrying original request:',
          originalRequest.url
        );
        // Повторяем оригинальный запрос с новым токеном
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh access token:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Если не удалось обновить токен, очищаем данные и перенаправляем на логин
        localStorage.removeItem('accessToken');
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Для других ошибок (403 и т.д.)
    if (error.response?.status === 403) {
      localStorage.removeItem('accessToken');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
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
  signIn: async (email, password, recaptchaToken = null) => {
    const response = await api.post('/auth/signin', {
      email,
      password,
      recaptchaToken,
    });
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

  // Обновление токена пользователя
  refreshUserToken: async () => {
    const response = await api.post('/users/refresh-token');
    return response.data;
  },
};

export default authService;
