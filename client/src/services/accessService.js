import axios from 'axios';

// На продакшене используем относительный путь /api (проксируется через nginx/Apache)
// В разработке (Vite dev server на 5173) используем localhost:3000
// В Docker (nginx на 8080) используем относительный путь /api
const getApiUrl = () => {
  // Если задана переменная окружения - используем её
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Проверяем порт для определения окружения
  const port = window.location.port;
  
  // Vite dev server обычно на 5173 или 5174 - только для него используем localhost:3000
  if (port === '5173' || port === '5174') {
    return 'http://localhost:3000/api';
  }
  
  // Во всех остальных случаях (Docker на 8080, production) используем относительный путь
  return '/api';
};

const API_URL = getApiUrl();

// Создаем экземпляр axios с теми же настройками, что и в authService
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor для логирования запросов
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor для логирования ответов и ошибок
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, response.status, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        // Если получили HTML вместо JSON, это значит Apache не проксирует запросы
        if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
            console.error('⚠️ Получен HTML вместо JSON! Apache не проксирует запросы к Node.js серверу.');
            console.error('Проверьте настройки Apache (ProxyPass /api http://localhost:3000/api)');
        }

        return Promise.reject(error);
    }
);

export const accessService = {
    // Получение последних данных от access.exe
    getLastData: async () => {
        try {
            console.log('🔍 Запрос данных от access.exe...');
            const response = await api.get('/access/last');
            console.log('📦 Получены данные:', response.data);

            // Проверяем, что получили JSON, а не HTML
            if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                throw new Error('Получен HTML вместо JSON. Apache не проксирует запросы к Node.js.');
            }

            return response.data;
        } catch (error) {
            console.error('❌ Ошибка при получении данных:', error);
            throw error;
        }
    },

    // Очистка данных
    clearData: async () => {
        try {
            console.log('🧹 Очистка данных...');
            const response = await api.post('/access/clear');
            console.log('✅ Данные очищены:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Ошибка при очистке данных:', error);
            throw error;
        }
    },
};

export default accessService;

