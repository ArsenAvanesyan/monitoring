import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import accessService from '../services/accessService';
import DevicesTable from '../components/dashboard/DevicesTable';
import KPICards from '../components/dashboard/KPICards';
import ChartsSection from '../components/dashboard/ChartsSection';
import { convertMinersToDevices } from '../components/dashboard/utils/minerDataConverter';

const Dashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('24h');
  const [accessDataArray, setAccessDataArray] = useState([]);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);

  // Преобразуем данные от access.exe в формат устройств
  const devices = convertMinersToDevices(accessDataArray);

  // Проверяем наличие данных
  const hasData = devices.length > 0;

  // Загрузка данных от access.exe
  const fetchAccessData = async () => {
    try {
      const response = await accessService.getLastData();
      console.log('📥 Ответ от сервера:', response);

      // Обновляем timestamp, если он есть в ответе (независимо от наличия данных)
      if (response && response.timestamp) {
        setLastUpdateTimestamp(response.timestamp);
      }

      if (
        response &&
        ((response.data !== null && response.data !== undefined) || response.allData)
      ) {
        // Используем реальные данные, если они есть, иначе все данные
        const dataToUse = response.hasRealData ? response.allData : response.allData || [];

        // Обрабатываем массив данных
        if (dataToUse && Array.isArray(dataToUse) && dataToUse.length > 0) {
          setAccessDataArray(dataToUse);
        } else if (Array.isArray(response.data)) {
          setAccessDataArray(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // Если один объект, оборачиваем в массив
          setAccessDataArray([response.data]);
        } else {
          setAccessDataArray([]);
        }
      } else {
        setAccessDataArray([]);
      }
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных от access.exe:', error);
      console.error('Детали ошибки:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      setAccessDataArray([]);
    }
  };

  // Обработка очистки данных
  const handleClearData = async () => {
    if (!window.confirm('Вы уверены, что хотите очистить все данные?')) {
      return;
    }

    try {
      console.log('🧹 Очистка данных...');
      await accessService.clearData();
      console.log('✅ Данные очищены');

      // Очищаем локальное состояние
      setAccessDataArray([]);
      setLastUpdateTimestamp(null);

      // Показываем уведомление (можно добавить toast)
      alert('Данные успешно очищены');
    } catch (error) {
      console.error('❌ Ошибка при очистке данных:', error);
      alert('Ошибка при очистке данных: ' + error.message);
    }
  };

  // Подключаемся к WebSocket и загружаем данные при монтировании
  useEffect(() => {
    // Загружаем данные один раз при монтировании
    fetchAccessData();

    // Определяем URL для WebSocket подключения (используем ту же логику, что и для API)
    const getSocketUrl = () => {
      // Если задана переменная окружения - используем её и убираем /api
      if (import.meta.env.VITE_API_URL) {
        const apiUrl = import.meta.env.VITE_API_URL;
        // Убираем /api из конца, если есть
        return apiUrl.replace(/\/api\/?$/, '');
      }

      // Проверяем порт для определения окружения
      const port = window.location.port;

      // Vite dev server обычно на 5173 или 5174 - используем localhost:3000 (без /api)
      if (port === '5173' || port === '5174') {
        return 'http://localhost:3000';
      }

      // Во всех остальных случаях (Docker на 8080, production) используем тот же хост
      // Socket.io автоматически подключится к правильному пути /socket.io/
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const hostname = window.location.hostname;
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    };

    const socketUrl = getSocketUrl();
    console.log('🔌 Подключение к WebSocket:', socketUrl);

    // Подключаемся к WebSocket серверу
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    // Обработка подключения
    socket.on('connect', () => {
      console.log('✅ WebSocket подключен:', socket.id);
    });

    // Обработка события получения данных
    socket.on('data-received', (data) => {
      console.log('📥 Данные получены от access.exe через WebSocket:', data);
      // Обновляем данные при получении события
      fetchAccessData();
    });

    // Обработка события очистки данных
    socket.on('data-cleared', (data) => {
      console.log('🧹 Данные очищены через WebSocket:', data);
      // Очищаем локальное состояние
      setAccessDataArray([]);
      setLastUpdateTimestamp(null);
    });

    // Обработка отключения
    socket.on('disconnect', (reason) => {
      console.warn('🔌 WebSocket отключен:', reason);
    });

    // Обработка ошибок подключения
    socket.on('connect_error', (error) => {
      console.error('❌ Ошибка подключения WebSocket:', error.message);
    });

    // Очистка при размонтировании
    return () => {
      socket.disconnect();
      console.log('🔌 WebSocket соединение закрыто');
    };
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full">
      <div className="w-full text-primary">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">{t('dashboard.title')}</h1>
            <p className="text-primary mb-8">{t('dashboard.subtitle')}</p>
          </div>
          {hasData && (
            <button
              onClick={handleClearData}
              className="btn btn-error btn-outline"
              title="Очистить все данные"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Очистить данные
            </button>
          )}
        </div>

        {/* KPI Cards */}
        {hasData ? (
          <>
            <KPICards devices={devices} />
            {/* Charts Section */}
            <ChartsSection timeRange={timeRange} onTimeRangeChange={setTimeRange} />
            {/* Devices Table - использует данные от access.exe */}
            <DevicesTable minersData={accessDataArray} lastUpdateTimestamp={lastUpdateTimestamp} />
          </>
        ) : (
          <div className="card bg-base-200 shadow-xl border border-secondary">
            <div className="card-body">
              <div className="text-center text-primary py-8">
                <p className="text-lg mb-2">{t('dashboard.noData')}</p>
                <p className="text-sm text-primary/70">{t('dashboard.noDataDescription')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
