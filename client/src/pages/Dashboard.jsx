import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import accessService from '../services/accessService';
import DevicesTable from '../components/dashboard/DevicesTable';
import KPICards from '../components/dashboard/KPICards';
import ChartsSection from '../components/dashboard/ChartsSection';
import { convertMinersToDevices } from '../components/dashboard/utils/minerDataConverter';

const Dashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('24h');
  const [accessDataArray, setAccessDataArray] = useState([]);

  // Преобразуем данные от access.exe в формат устройств
  const devices = convertMinersToDevices(accessDataArray);

  // Проверяем наличие данных
  const hasData = devices.length > 0;

  // Загрузка данных от access.exe
  const fetchAccessData = async () => {
    try {
      console.log('🔄 Начало загрузки данных от access.exe...');
      const response = await accessService.getLastData();
      console.log('📥 Ответ от сервера:', response);

      if (
        response &&
        ((response.data !== null && response.data !== undefined) ||
          response.allData)
      ) {
        console.log('✅ Данные получены:', response);
        console.log(
          '  Реальных данных:',
          response.hasRealData ? 'ЕСТЬ' : 'НЕТ'
        );
        console.log(
          '  Тестовых данных:',
          response.hasTestData ? 'ЕСТЬ' : 'НЕТ'
        );
        console.log(
          '  Всего объектов:',
          response.totalCount || response.count || 0
        );

        // Используем реальные данные, если они есть, иначе все данные
        const dataToUse = response.hasRealData
          ? response.allData
          : response.allData || [];

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
        console.log('ℹ️ Данные еще не получены от access.exe');
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

  // Загружаем данные при монтировании и обновляем каждые 5 секунд
  useEffect(() => {
    fetchAccessData();
    console.log("♥♦♣♠←------→♥♦♣♠")
    const interval = setInterval(fetchAccessData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='p-4 md:p-6 lg:p-8 w-full'>
      <div className='w-full text-primary'>
        <h1 className='text-3xl font-bold mb-2 text-primary'>
          {t('dashboard.title')}
        </h1>
        <p className='text-primary mb-8'>{t('dashboard.subtitle')}</p>

        {/* KPI Cards */}
        {hasData ? (
          <>
            <KPICards devices={devices} />
            {/* Charts Section */}
            <ChartsSection timeRange={timeRange} onTimeRangeChange={setTimeRange} />
            {/* Devices Table - использует данные от access.exe */}
            <DevicesTable minersData={accessDataArray} />
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
