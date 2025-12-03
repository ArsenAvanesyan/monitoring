import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import accessService from '../services/accessService';

const Dashboard = () => {
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedDevices, setSelectedDevices] = useState(new Set());
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterStatus, setFilterStatus] = useState(null);
    const [accessData, setAccessData] = useState(null);
    const [accessDataArray, setAccessDataArray] = useState([]);
    const [accessHexData, setAccessHexData] = useState(null);
    const [accessTimestamp, setAccessTimestamp] = useState(null);
    const [isLoadingAccessData, setIsLoadingAccessData] = useState(false);
    const [showHex, setShowHex] = useState(false);
    const [showMinersTable, setShowMinersTable] = useState(true);
    const [hasRealData, setHasRealData] = useState(false);
    const [hasTestData, setHasTestData] = useState(false);

    // Mock data - в будущем будет из API
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

    const hashrateHistory = [
        { time: '00:00', value: 2.38 },
        { time: '02:00', value: 2.41 },
        { time: '04:00', value: 2.35 },
        { time: '06:00', value: 2.43 },
        { time: '08:00', value: 2.39 },
        { time: '10:00', value: 2.47 },
        { time: '12:00', value: 2.44 },
        { time: '14:00', value: 2.42 },
        { time: '16:00', value: 2.48 },
        { time: '18:00', value: 2.45 },
        { time: '20:00', value: 2.46 },
        { time: '22:00', value: 2.45 },
        { time: '24:00', value: 2.45 }
    ];

    const temperatureDistribution = [
        { name: '<60°C', value: 5 },
        { name: '60-65°C', value: 18 },
        { name: '65-70°C', value: 42 },
        { name: '70-75°C', value: 38 },
        { name: '75-80°C', value: 15 },
        { name: '>80°C', value: 0 }
    ];

    // Mock devices data
    const mockDevices = [
        {
            id: '1',
            name: 'Antminer T21',
            model: 'Antminer T21',
            status: 'online',
            hashrate: 205,
            hashrateUnit: 'TH/s',
            temperature: 75,
            fanSpeed: 7000,
            pool: 'PoolA',
            worker: 'farm-01',
            ipAddress: '10.0.1.45',
            uptime: '5d 14h'
        },
        {
            id: '2',
            name: 'Antminer S19j Pro',
            model: 'Antminer S19j Pro',
            status: 'degraded',
            hashrate: 104,
            hashrateUnit: 'TH/s',
            temperature: 69,
            fanSpeed: 6400,
            pool: 'PoolB',
            worker: 'farm-02',
            ipAddress: '10.0.1.68',
            uptime: '2d 3h'
        },
        {
            id: '3',
            name: 'Antminer S19 XP',
            model: 'Antminer S19 XP',
            status: 'online',
            hashrate: 140,
            hashrateUnit: 'TH/s',
            temperature: 71,
            fanSpeed: 6800,
            pool: 'PoolA',
            worker: 'farm-03',
            ipAddress: '10.0.1.72',
            uptime: '12d 7h'
        },
        {
            id: '4',
            name: 'Whatsminer M50S',
            model: 'Whatsminer M50S',
            status: 'online',
            hashrate: 126,
            hashrateUnit: 'TH/s',
            temperature: 68,
            fanSpeed: 6200,
            pool: 'PoolA',
            worker: 'farm-04',
            ipAddress: '10.0.1.89',
            uptime: '8d 22h'
        },
        {
            id: '5',
            name: 'Antminer T21',
            model: 'Antminer T21',
            status: 'offline',
            hashrate: 0,
            hashrateUnit: 'TH/s',
            temperature: 0,
            fanSpeed: 0,
            pool: 'PoolA',
            worker: 'farm-05',
            ipAddress: '10.0.1.92',
            uptime: '0h'
        },
        {
            id: '6',
            name: 'Antminer S19j Pro',
            model: 'Antminer S19j Pro',
            status: 'online',
            hashrate: 100,
            hashrateUnit: 'TH/s',
            temperature: 70,
            fanSpeed: 6500,
            pool: 'PoolB',
            worker: 'farm-06',
            ipAddress: '10.0.1.103',
            uptime: '6d 18h'
        },
        {
            id: '7',
            name: 'Antminer S19 XP',
            model: 'Antminer S19 XP',
            status: 'online',
            hashrate: 141,
            hashrateUnit: 'TH/s',
            temperature: 72,
            fanSpeed: 6900,
            pool: 'PoolA',
            worker: 'farm-07',
            ipAddress: '10.0.1.115',
            uptime: '15d 4h'
        },
        {
            id: '8',
            name: 'Whatsminer M50S',
            model: 'Whatsminer M50S',
            status: 'degraded',
            hashrate: 118,
            hashrateUnit: 'TH/s',
            temperature: 76,
            fanSpeed: 7200,
            pool: 'PoolB',
            worker: 'farm-08',
            ipAddress: '10.0.1.128',
            uptime: '3d 11h'
        }
    ];

    const kpiCards = [
        {
            label: t('dashboard.totalHashrate'),
            value: `${kpiData.totalHashrate} ${kpiData.totalHashrateUnit}`,
            trend: 2.4,
            trendLabel: `+2.4% ${t('dashboard.fromLastHour')}`,
            sparkline: [2.35, 2.38, 2.41, 2.39, 2.43, 2.45]
        },
        {
            label: t('dashboard.devicesOnline'),
            value: `${kpiData.devicesOnline} / ${kpiData.devicesTotal}`,
            trend: -0.8,
            trendLabel: `${kpiData.devicesTotal - kpiData.devicesOnline} ${t('dashboard.devicesOffline')}`,
            sparkline: [120, 118, 119, 118, 119, 118]
        },
        {
            label: t('dashboard.averageTemperature'),
            value: `${kpiData.avgTemperature}°C`,
            trend: 1.2,
            trendLabel: `+1.2°C ${t('dashboard.fromOptimal')}`,
            sparkline: [70, 71, 72, 71, 72, 72]
        },
        {
            label: t('dashboard.averageFanSpeed'),
            value: `${kpiData.avgFanSpeed.toLocaleString()} RPM`,
            trend: 0.5,
            trendLabel: t('dashboard.withinNormalRange'),
            sparkline: [6800, 6820, 6850, 6830, 6840, 6850]
        },
        {
            label: t('dashboard.uptime'),
            value: `${kpiData.uptime}%`,
            trend: 0.02,
            trendLabel: `99.95% ${t('dashboard.last30Days')}`,
            sparkline: [99.94, 99.95, 99.96, 99.97, 99.97, 99.97]
        },
        {
            label: t('dashboard.activePools'),
            value: kpiData.activePools.toString(),
            trendLabel: `1 ${t('dashboard.failoverPool')}`,
            sparkline: [2, 2, 2, 2, 2, 2]
        }
    ];

    const renderSparkline = (data) => {
        if (!data || data.length === 0) return null;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const width = 100 / data.length;

        return (
            <div className="h-8 flex items-end gap-0.5 mt-2">
                {data.map((value, i) => {
                    const height = ((value - min) / range) * 100;
                    return (
                        <div
                            key={i}
                            className="flex-1 bg-success rounded-sm"
                            style={{ height: `${Math.max(height, 20)}%` }}
                        />
                    );
                })}
            </div>
        );
    };

    const renderTrendIcon = (trend) => {
        if (trend === undefined) return null;
        return (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-success' : 'text-error'
                }`}>
                {trend > 0 ? '↑' : '↓'}
                {Math.abs(trend)}%
            </div>
        );
    };

    // Table handlers
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = () => {
        if (selectedDevices.size === mockDevices.length) {
            setSelectedDevices(new Set());
        } else {
            setSelectedDevices(new Set(mockDevices.map(d => d.id)));
        }
    };

    const handleSelectDevice = (id) => {
        const newSelected = new Set(selectedDevices);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedDevices(newSelected);
    };

    let filteredDevices = mockDevices;
    if (filterStatus) {
        filteredDevices = mockDevices.filter(d => d.status === filterStatus);
    }

    const sortedDevices = [...filteredDevices].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'online':
                return <span className="badge badge-success badge-sm">{t('dashboard.online')}</span>;
            case 'degraded':
                return <span className="badge badge-warning badge-sm">{t('dashboard.degraded')}</span>;
            case 'offline':
                return <span className="badge badge-error badge-sm">{t('dashboard.offline')}</span>;
            default:
                return <span className="badge badge-ghost badge-sm">{status}</span>;
        }
    };

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
                }, 5000);
            }
        } catch (error) {
            console.error('Ошибка при очистке данных:', error);
        }
    };

    // Загружаем данные при монтировании и обновляем каждые 2 секунды
    useEffect(() => {
        fetchAccessData();
        const interval = setInterval(fetchAccessData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Форматирование времени
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Функция для получения статуса майнера
    const getMinerStatus = (miner) => {
        if (miner.error) {
            if (miner.error === 'Bad server address' || miner.st === 4) {
                return { status: 'error', label: 'Ошибка адреса', color: 'badge-error' };
            }
            if (miner.error === 'Timeout') {
                return { status: 'timeout', label: 'Таймаут', color: 'badge-warning' };
            }
            return { status: 'error', label: miner.error, color: 'badge-error' };
        }
        if (miner.st === '200' || miner.st === 200) {
            return { status: 'online', label: 'Онлайн', color: 'badge-success' };
        }
        if (miner.st === '401' || miner.st === 401) {
            return { status: 'unauthorized', label: 'Не авторизован', color: 'badge-warning' };
        }
        if (miner.st === '404' || miner.st === 404) {
            return { status: 'notfound', label: 'Не найден', color: 'badge-error' };
        }
        return { status: 'unknown', label: `Статус: ${miner.st}`, color: 'badge-ghost' };
    };

    // Функция для получения типа майнера
    const getMinerType = (miner) => {
        if (miner.mtype && miner.mtype.miner_type) {
            return miner.mtype.miner_type;
        }
        if (miner.dtype) {
            return miner.dtype;
        }
        return 'Неизвестно';
    };

    // Функция для получения hashrate
    const getHashrate = (miner) => {
        if (miner.summ && miner.summ.SUMMARY && miner.summ.SUMMARY[0]) {
            const summary = miner.summ.SUMMARY[0];
            if (summary.rate_avg) {
                return {
                    value: summary.rate_avg,
                    unit: summary.rate_unit || '/s'
                };
            }
        }
        return null;
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full">
            <div className="w-full text-primary">
                <h1 className="text-3xl font-bold mb-2 text-primary">{t('dashboard.title')}</h1>
                <p className="text-primary mb-8">{t('dashboard.subtitle')}</p>

                {/* Компонент отображения данных от access.exe */}
                {(accessData || accessDataArray.length > 0) && (
                    <div className="card bg-base-200 shadow-xl border border-secondary mb-8">
                        <div className="card-body">
                            {/* Предупреждение, если только тестовые данные */}
                            {hasTestData && !hasRealData && (
                                <div className="alert alert-warning mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-bold">Отображаются только тестовые данные!</h3>
                                        <div className="text-xs">Запустите access.exe для получения реальных данных от майнеров.</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="card-title text-lg text-primary">
                                    📊 Данные от access.exe
                                    {accessDataArray.length > 0 && (
                                        <span className="badge badge-primary badge-sm ml-2">
                                            {accessDataArray.length} майнеров
                                        </span>
                                    )}
                                    {hasRealData && (
                                        <span className="badge badge-success badge-sm ml-2">
                                            Реальные данные
                                        </span>
                                    )}
                                    {hasTestData && !hasRealData && (
                                        <span className="badge badge-warning badge-sm ml-2">
                                            Только тестовые
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {accessTimestamp && (
                                        <span className="text-xs text-primary/70">
                                            Обновлено: {formatTimestamp(accessTimestamp)}
                                        </span>
                                    )}
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        onClick={fetchAccessData}
                                        disabled={isLoadingAccessData}
                                        title="Обновить данные"
                                    >
                                        {isLoadingAccessData ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-error btn-outline"
                                        onClick={clearAccessData}
                                        title="Очистить данные"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Вкладки для переключения между таблицей майнеров, JSON и Hex */}
                            <div className="tabs tabs-boxed mb-4">
                                {accessDataArray.length > 0 && (
                                    <button
                                        className={`tab ${showMinersTable && !showHex ? 'tab-active' : ''}`}
                                        onClick={() => { setShowMinersTable(true); setShowHex(false); }}
                                    >
                                        Майнеры ({accessDataArray.length})
                                    </button>
                                )}
                                <button
                                    className={`tab ${!showMinersTable && !showHex ? 'tab-active' : ''}`}
                                    onClick={() => { setShowMinersTable(false); setShowHex(false); }}
                                >
                                    JSON
                                </button>
                                {accessHexData && (
                                    <button
                                        className={`tab ${showHex ? 'tab-active' : ''}`}
                                        onClick={() => { setShowMinersTable(false); setShowHex(true); }}
                                    >
                                        Hex
                                    </button>
                                )}
                            </div>

                            {/* Таблица майнеров */}
                            {showMinersTable && accessDataArray.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra w-full">
                                        <thead>
                                            <tr>
                                                <th>IP адрес</th>
                                                <th>Тип майнера</th>
                                                <th>Статус</th>
                                                <th>Hashrate</th>
                                                <th>Информация</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accessDataArray.map((miner, index) => {
                                                const status = getMinerStatus(miner);
                                                const minerType = getMinerType(miner);
                                                const hashrate = getHashrate(miner);
                                                return (
                                                    <tr key={index}>
                                                        <td className="font-mono text-sm">{miner.ip || 'N/A'}</td>
                                                        <td>
                                                            <div className="text-sm">{minerType}</div>
                                                            {miner.mtype && miner.mtype.fw_version && (
                                                                <div className="text-xs text-primary/70">
                                                                    FW: {miner.mtype.fw_version.substring(0, 20)}...
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${status.color} badge-sm`}>
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {hashrate ? (
                                                                <span className="font-mono">
                                                                    {hashrate.value.toFixed(2)} {hashrate.unit}
                                                                </span>
                                                            ) : (
                                                                <span className="text-primary/50">—</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="text-xs">
                                                                {miner.error && (
                                                                    <div className="text-error">Ошибка: {miner.error}</div>
                                                                )}
                                                                {miner.st && (
                                                                    <div>Код: {miner.st}</div>
                                                                )}
                                                                {miner.pools && miner.pools.STATUS && (
                                                                    <div className="text-success">
                                                                        Пуллы: {miner.pools.STATUS.STATUS}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* JSON данные */}
                            {!showMinersTable && !showHex && (
                                <div className="bg-base-300 rounded-lg p-4 overflow-auto max-h-96">
                                    <pre className="text-xs text-primary whitespace-pre-wrap break-words font-mono">
                                        {JSON.stringify(accessData, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Hex данные */}
                            {!showMinersTable && showHex && accessHexData && (
                                <div className="bg-base-300 rounded-lg p-4 overflow-auto max-h-96">
                                    <pre className="text-xs text-primary whitespace-pre font-mono">
                                        {accessHexData}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!accessData && !isLoadingAccessData && (
                    <div className="alert alert-info mb-8">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Данные от access.exe еще не получены. Запустите access.exe для отправки данных на сервер.</span>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    {kpiCards.map((card, index) => (
                        <div key={index} className="card bg-base-200 shadow-xl border border-secondary h-full flex flex-col">
                            <div className="card-body p-5 flex flex-col flex-1">
                                <div className="flex items-start justify-between mb-2 min-h-[2.5rem]">
                                    <p className="text-sm text-primary leading-tight">{card.label}</p>
                                    {card.trend !== undefined && renderTrendIcon(card.trend)}
                                </div>
                                <div className="mb-2">
                                    <p className="text-2xl font-bold text-primary mb-1">{card.value}</p>
                                    {card.trendLabel && (
                                        <p className="text-xs text-primary min-h-[1rem]">{card.trendLabel}</p>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    {card.sparkline && renderSparkline(card.sparkline)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Hashrate Over Time */}
                    <div className="card bg-base-200 shadow-xl border border-secondary">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="card-title text-lg text-primary">{t('dashboard.hashrateOverTime')}</h2>
                                    <p className="text-sm text-primary">{t('dashboard.realTimePerformance')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="join">
                                        <button
                                            className={`btn btn-sm join-item ${timeRange === '24h' ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setTimeRange('24h')}
                                        >
                                            24h
                                        </button>
                                        <button
                                            className={`btn btn-sm join-item ${timeRange === '7d' ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setTimeRange('7d')}
                                        >
                                            7d
                                        </button>
                                    </div>
                                    <button className="btn btn-ghost btn-sm btn-circle">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="h-64 flex items-center justify-center text-primary">
                                <div className="text-center">
                                    <p className="mb-2 text-primary">График хешрейта</p>
                                    <p className="text-xs text-primary">Здесь будет график с использованием библиотеки для графиков</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Temperature Distribution */}
                    <div className="card bg-base-200 shadow-xl border border-secondary">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="card-title text-lg text-primary">{t('dashboard.temperatureDistribution')}</h2>
                                    <p className="text-sm text-primary">{t('dashboard.deviceTemperatureRanges')}</p>
                                </div>
                                <button className="btn btn-ghost btn-sm btn-circle">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="h-64 flex items-center justify-center text-primary">
                                <div className="text-center">
                                    <p className="mb-2 text-primary">График распределения температуры</p>
                                    <p className="text-xs text-primary">Здесь будет график с использованием библиотеки для графиков</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Devices Table */}
                <div className="card bg-base-200 shadow-xl border border-secondary">
                    {/* Table Header */}
                    <div className="card-body p-0">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 p-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-primary">{t('dashboard.devices')}</h3>
                                <span className="badge badge-ghost">{filteredDevices.length} {t('dashboard.total')}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Filter Dropdown */}
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        {t('dashboard.filter')}
                                        {filterStatus && <span className="badge badge-sm ml-1">1</span>}
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300">
                                        <li><button onClick={() => setFilterStatus(null)}>{t('dashboard.allDevices')}</button></li>
                                        <li><button onClick={() => setFilterStatus('online')}>{t('dashboard.onlineOnly')}</button></li>
                                        <li><button onClick={() => setFilterStatus('degraded')}>{t('dashboard.degradedOnly')}</button></li>
                                        <li><button onClick={() => setFilterStatus('offline')}>{t('dashboard.offlineOnly')}</button></li>
                                    </ul>
                                </div>

                                {/* Bulk Actions */}
                                {selectedDevices.size > 0 && (
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                                            {t('dashboard.bulkActions')} ({selectedDevices.size})
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300">
                                            <li><button>{t('dashboard.rebootSelected')}</button></li>
                                            <li><button>{t('dashboard.changePools')}</button></li>
                                            <li><button>{t('dashboard.updateFirmware')}</button></li>
                                            <li className="divider"></li>
                                            <li><button className="text-error">{t('dashboard.pauseMining')}</button></li>
                                        </ul>
                                    </div>
                                )}

                                <button className="btn btn-sm btn-ghost">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {t('dashboard.export')}
                                </button>
                                <button className="btn btn-sm btn-ghost">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {t('dashboard.refresh')}
                                </button>
                                <button className="btn btn-sm btn-primary">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    {t('dashboard.addDevice')}
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm input-info"
                                                checked={selectedDevices.size === mockDevices.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="cursor-pointer text-primary" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-2">
                                                {t('dashboard.deviceModel')}
                                                {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="cursor-pointer text-primary" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">
                                                {t('common.status')}
                                                {sortKey === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="cursor-pointer text-primary" onClick={() => handleSort('hashrate')}>
                                            <div className="flex items-center gap-2">
                                                {t('devices.hashrate')}
                                                {sortKey === 'hashrate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="cursor-pointer text-primary" onClick={() => handleSort('temperature')}>
                                            <div className="flex items-center gap-2">
                                                {t('devices.temperature')}
                                                {sortKey === 'temperature' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </div>
                                        </th>
                                        <th className="text-primary">{t('dashboard.fanSpeed')}</th>
                                        <th className="text-primary">{t('dashboard.pool')}</th>
                                        <th className="text-primary">{t('dashboard.worker')}</th>
                                        <th className="text-primary">{t('dashboard.ipAddress')}</th>
                                        <th className="text-primary">{t('dashboard.uptime')}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDevices.map((device) => (
                                        <tr
                                            key={device.id}
                                            className={`hover ${device.status === 'offline' ? 'opacity-60' : ''}`}
                                        >
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-sm input-info"
                                                    checked={selectedDevices.has(device.id)}
                                                    onChange={() => handleSelectDevice(device.id)}
                                                />
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-semibold text-primary">{device.name}</p>
                                                    <p className="text-xs text-primary">{device.model}</p>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(device.status)}</td>
                                            <td>
                                                <span className="text-primary">
                                                    {device.hashrate > 0 ? `${device.hashrate} ${device.hashrateUnit}` : '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary">
                                                        {device.temperature > 0 ? `${device.temperature}°C` : '—'}
                                                    </span>
                                                    {device.temperature > 75 && (
                                                        <span className="h-2 w-2 rounded-full bg-warning"></span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-primary">
                                                    {device.fanSpeed > 0 ? `${device.fanSpeed.toLocaleString()} RPM` : '—'}
                                                </span>
                                            </td>
                                            <td><span className="text-primary">{device.pool}</span></td>
                                            <td><span className="text-primary">{device.worker}</span></td>
                                            <td><span className="font-mono text-xs text-primary">{device.ipAddress}</span></td>
                                            <td><span className="text-primary">{device.uptime}</span></td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div className="dropdown dropdown-end">
                                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </div>
                                                    <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300">
                                                        <li><button>{t('dashboard.viewDetails')}</button></li>
                                                        <li><button>{t('dashboard.rebootDevice')}</button></li>
                                                        <li><button>{t('dashboard.changePools')}</button></li>
                                                        <li><button>{t('dashboard.restartMiner')}</button></li>
                                                        <li className="divider"></li>
                                                        <li><button>{t('dashboard.viewLogs')}</button></li>
                                                        <li><button className="text-error">{t('dashboard.pauseMining')}</button></li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-base-300 p-4">
                            <p className="text-sm text-primary">
                                {t('dashboard.showing')} {sortedDevices.length} {t('dashboard.of')} {mockDevices.length} {t('dashboard.devices').toLowerCase()}
                            </p>
                            <div className="join">
                                <button className="btn btn-sm join-item" disabled>«</button>
                                <button className="btn btn-sm join-item btn-active">1</button>
                                <button className="btn btn-sm join-item" disabled>»</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
