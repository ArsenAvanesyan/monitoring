import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import accessService from '../services/accessService';
import AccessDataCard from '../components/dashboard/AccessDataCard';
import DevicesTable from '../components/dashboard/DevicesTable';
import KPICards from '../components/dashboard/KPICards';
import ChartsSection from '../components/dashboard/ChartsSection';
import { convertMinersToDevices } from '../components/dashboard/utils/minerDataConverter';

const Dashboard = () => {
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState('24h');
    const [accessData, setAccessData] = useState(null);
    const [accessDataArray, setAccessDataArray] = useState([]);
    const [accessHexData, setAccessHexData] = useState(null);
    const [accessTimestamp, setAccessTimestamp] = useState(null);
    const [isLoadingAccessData, setIsLoadingAccessData] = useState(false);
    const [hasRealData, setHasRealData] = useState(false);
    const [hasTestData, setHasTestData] = useState(false);

    // Mock data для KPI (используется если нет реальных данных)
    const kpiData = {
        totalHashrate: 2.45,
        totalHashrateUnit: 'PH/s',
        devicesOnline: 118,
        devicesTotal: 130,
        avgTemperature: 72,
        avgFanSpeed: 6850,
        uptime: 99.97,
        activePools: 2
    };

    // Преобразуем данные от access.exe в формат устройств
    const devices = convertMinersToDevices(accessDataArray);

    // Загрузка данных от access.exe
    const fetchAccessData = async () => {
        try {
            setIsLoadingAccessData(true);
            console.log('🔄 Начало загрузки данных от access.exe...');
            const response = await accessService.getLastData();
            console.log('📥 Ответ от сервера:', response);

            if (response && (response.data !== null && response.data !== undefined || response.allData)) {
                console.log('✅ Данные получены:', response);
                console.log('  Реальных данных:', response.hasRealData ? 'ЕСТЬ' : 'НЕТ');
                console.log('  Тестовых данных:', response.hasTestData ? 'ЕСТЬ' : 'НЕТ');
                console.log('  Всего объектов:', response.totalCount || response.count || 0);

                setHasRealData(response.hasRealData || false);
                setHasTestData(response.hasTestData || false);

                // Используем реальные данные, если они есть, иначе все данные
                const dataToUse = response.hasRealData ? response.allData : (response.allData || []);

                setAccessData(response.data);
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
                setAccessHexData(response.hexData || null);
                setAccessTimestamp(response.timestamp);
            } else {
                console.log('ℹ️ Данные еще не получены от access.exe');
                setAccessData(null);
                setAccessDataArray([]);
                setAccessHexData(null);
                setAccessTimestamp(null);
                setHasRealData(false);
                setHasTestData(false);
            }
        } catch (error) {
            console.error('❌ Ошибка при загрузке данных от access.exe:', error);
            console.error('Детали ошибки:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            setAccessData(null);
            setAccessDataArray([]);
            setAccessHexData(null);
            setAccessTimestamp(null);
        } finally {
            setIsLoadingAccessData(false);
        }
    };

    // Очистка данных
    const clearAccessData = async () => {
        try {
            if (window.confirm('Вы уверены, что хотите очистить все данные от access.exe?')) {
                await accessService.clearData();
                // Обновляем данные после очистки
                setTimeout(() => {
                    fetchAccessData();
                }, 500);
            }
        } catch (error) {
            console.error('Ошибка при очистке данных:', error);
        }
    };

    // Загружаем данные при монтировании и обновляем каждые 5 секунд
    useEffect(() => {
        fetchAccessData();
        const interval = setInterval(fetchAccessData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full">
            <div className="w-full text-primary">
                <h1 className="text-3xl font-bold mb-2 text-primary">{t('dashboard.title')}</h1>
                <p className="text-primary mb-8">{t('dashboard.subtitle')}</p>

                {/* Компонент отображения данных от access.exe */}
                <AccessDataCard
                    accessData={accessData}
                    accessDataArray={accessDataArray}
                    accessHexData={accessHexData}
                    accessTimestamp={accessTimestamp}
                    isLoadingAccessData={isLoadingAccessData}
                    hasRealData={hasRealData}
                    hasTestData={hasTestData}
                    onRefresh={fetchAccessData}
                    onClear={clearAccessData}
                />

                {!accessData && accessDataArray.length === 0 && !isLoadingAccessData && (
                    <div className="alert alert-info mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Данные от access.exe еще не получены. Запустите access.exe для отправки данных на сервер.</span>
                    </div>
                )}

                {/* KPI Cards */}
                <KPICards kpiData={kpiData} devices={devices} />

                {/* Charts Section */}
                <ChartsSection
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                />

                {/* Devices Table - использует данные от access.exe */}
                <DevicesTable minersData={accessDataArray} />
            </div>
        </div>
    );
};

export default Dashboard;
