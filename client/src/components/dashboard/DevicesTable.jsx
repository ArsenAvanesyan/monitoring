import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { convertMinersToDevices } from './utils/minerDataConverter';

const DevicesTable = ({ minersData = [] }) => {
    const { t } = useTranslation();
    const [selectedDevices, setSelectedDevices] = useState(new Set());
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterStatus, setFilterStatus] = useState(null);

    // Преобразуем данные от access.exe в формат для таблицы
    const devices = convertMinersToDevices(minersData);

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
        if (selectedDevices.size === devices.length) {
            setSelectedDevices(new Set());
        } else {
            setSelectedDevices(new Set(devices.map(d => d.id)));
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

    // Фильтрация и сортировка
    let filteredDevices = devices;
    if (filterStatus) {
        filteredDevices = devices.filter(d => d.status === filterStatus);
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

    if (devices.length === 0) {
        return (
            <div className="card bg-base-200 shadow-xl border border-secondary">
                <div className="card-body">
                    <div className="text-center text-primary py-8">
                        <p className="text-lg mb-2">Нет данных об устройствах</p>
                        <p className="text-sm text-primary/70">Запустите access.exe для получения данных от майнеров</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
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
                                        checked={selectedDevices.size === devices.length && devices.length > 0}
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
                                            {device.hashrate > 0 ? `${device.hashrate.toFixed(2)} ${device.hashrateUnit}` : '—'}
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
                        {t('dashboard.showing')} {sortedDevices.length} {t('dashboard.of')} {devices.length} {t('dashboard.devices').toLowerCase()}
                    </p>
                    <div className="join">
                        <button className="btn btn-sm join-item" disabled>«</button>
                        <button className="btn btn-sm join-item btn-active">1</button>
                        <button className="btn btn-sm join-item" disabled>»</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevicesTable;

