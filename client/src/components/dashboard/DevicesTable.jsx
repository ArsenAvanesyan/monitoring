import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertMinersToDevices } from './utils/minerDataConverter';
import {
  ChevronDownIcon,
  FilterIcon,
  ExportIcon,
  RefreshIcon,
  AddIcon,
  MenuDotsIcon,
} from '../../svg/icons';

const DevicesTable = ({ minersData = [] }) => {
  const { t } = useTranslation();
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState(null);
  const [onlyActiveMiners, setOnlyActiveMiners] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

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
      setSelectedDevices(new Set(devices.map((d) => d.id)));
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
    filteredDevices = devices.filter((d) => d.status === filterStatus);
  }
  // Фильтр "Только активные майнеры" (online и degraded)
  if (onlyActiveMiners) {
    filteredDevices = filteredDevices.filter(
      (d) => d.status === 'online' || d.status === 'degraded'
    );
  }

  // Функция для преобразования IP адреса в число для сортировки
  const ipToNumber = (ip) => {
    if (!ip || typeof ip !== 'string') return 0;
    const parts = ip.split('.').map((part) => parseInt(part, 10));
    if (parts.length !== 4 || parts.some(isNaN)) return 0;
    // Преобразуем IP в число: a.b.c.d = a*256^3 + b*256^2 + c*256 + d
    return parts[0] * 256 * 256 * 256 + parts[1] * 256 * 256 + parts[2] * 256 + parts[3];
  };

  // Функция для получения значения для сортировки
  const getSortValue = (device, key) => {
    switch (key) {
      case 'name':
        return device.name || '';
      case 'model':
        return device.model || '';
      case 'status':
        return device.status || '';
      case 'hashrate':
        return device.hashrate || 0;
      case 'temperature':
        return device.temperature || 0;
      case 'fanSpeed':
        return device.fanSpeed || 0;
      case 'pool':
        return device.pool || '';
      case 'worker':
        return device.worker || '';
      case 'ipAddress':
        // Преобразуем IP адрес в число для правильной сортировки
        return ipToNumber(device.ipAddress);
      case 'uptime':
        // Парсим uptime для сортировки (например, "4d 20h" -> дни*24 + часы)
        if (typeof device.uptime === 'string') {
          const match = device.uptime.match(/(\d+)d\s*(\d+)h/);
          if (match) {
            return parseInt(match[1]) * 24 + parseInt(match[2]);
          }
          const hoursMatch = device.uptime.match(/(\d+)h/);
          if (hoursMatch) {
            return parseInt(hoursMatch[1]);
          }
        }
        return 0;
      default:
        return device[key] || '';
    }
  };

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // Пагинация
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(sortedDevices.length / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? sortedDevices.length : startIndex + itemsPerPage;
  const paginatedDevices = sortedDevices.slice(startIndex, endIndex);

  // Сброс страницы при изменении фильтров или количества элементов
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, itemsPerPage, onlyActiveMiners]);

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
            <p className="text-sm text-primary/70">
              Запустите access.exe для получения данных от майнеров
            </p>
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
            <div className="btn btn-sm btn-ghost">
              {filteredDevices.length} {t('dashboard.total')}
            </div>
            {/* Выбор количества элементов на странице */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                {itemsPerPage === 'all' ? t('dashboard.showAll') : itemsPerPage}{' '}
                {t('dashboard.itemsPerPage')}
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-200 rounded-box z-[1] w-40 p-2 shadow-lg border border-base-300"
              >
                <li>
                  <button
                    onClick={(e) => {
                      setItemsPerPage(50);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.show50')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      setItemsPerPage(100);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.show100')}
                  </button>
                </li>
                {/* <li><button onClick={() => setItemsPerPage(255)}>{t('dashboard.show255')}</button></li> */}
                <li>
                  <button
                    onClick={(e) => {
                      setItemsPerPage('all');
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.showAll')}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                <FilterIcon className="w-4 h-4" />
                {t('dashboard.filter')}
                {(filterStatus || onlyActiveMiners) && (
                  <span className="badge badge-sm ml-1">
                    {(filterStatus ? 1 : 0) + (onlyActiveMiners ? 1 : 0)}
                  </span>
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
              >
                <li>
                  <button
                    className={`w-full text-left`}
                    onClick={(e) => {
                      setFilterStatus(null);
                      setOnlyActiveMiners(false);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.allDevices')}
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left`}
                    onClick={(e) => {
                      setOnlyActiveMiners(true);
                      setFilterStatus(null);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.onlyActiveMiners')}
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left`}
                    onClick={(e) => {
                      setFilterStatus('online');
                      setOnlyActiveMiners(false);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.onlineOnly')}
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left`}
                    onClick={(e) => {
                      setFilterStatus('degraded');
                      setOnlyActiveMiners(false);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.degradedOnly')}
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left`}
                    onClick={(e) => {
                      setFilterStatus('offline');
                      setOnlyActiveMiners(false);
                      e.currentTarget.closest('.dropdown')?.querySelector('[tabIndex]')?.blur();
                    }}
                  >
                    {t('dashboard.offlineOnly')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Bulk Actions */}
            {selectedDevices.size > 0 && (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                  {t('dashboard.bulkActions')} ({selectedDevices.size})
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
                >
                  <li>
                    <button>{t('dashboard.rebootSelected')}</button>
                  </li>
                  <li>
                    <button>{t('dashboard.changePools')}</button>
                  </li>
                  <li>
                    <button>{t('dashboard.updateFirmware')}</button>
                  </li>
                  <li className="divider"></li>
                  <li>
                    <button className="text-error">{t('dashboard.pauseMining')}</button>
                  </li>
                </ul>
              </div>
            )}

            <button className="btn btn-sm btn-ghost">
              <ExportIcon className="w-4 h-4" />
              {t('dashboard.export')}
            </button>
            <button className="btn btn-sm btn-ghost">
              <RefreshIcon className="w-4 h-4" />
              {t('dashboard.refresh')}
            </button>
            <button className="btn btn-sm btn-primary">
              <AddIcon className="w-4 h-4" />
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
                <th
                  className="cursor-pointer text-primary"
                  onClick={() => handleSort('temperature')}
                >
                  <div className="flex items-center gap-2">
                    {t('devices.temperature')}
                    {sortKey === 'temperature' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="cursor-pointer text-primary" onClick={() => handleSort('fanSpeed')}>
                  <div className="flex items-center gap-2">
                    {t('dashboard.fanSpeed')}
                    {sortKey === 'fanSpeed' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="cursor-pointer text-primary" onClick={() => handleSort('pool')}>
                  <div className="flex items-center gap-2">
                    {t('dashboard.pool')}
                    {sortKey === 'pool' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="cursor-pointer text-primary" onClick={() => handleSort('worker')}>
                  <div className="flex items-center gap-2">
                    {t('dashboard.worker')}
                    {sortKey === 'worker' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="cursor-pointer text-primary" onClick={() => handleSort('ipAddress')}>
                  <div className="flex items-center gap-2">
                    {t('dashboard.ipAddress')}
                    {sortKey === 'ipAddress' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="cursor-pointer text-primary" onClick={() => handleSort('uptime')}>
                  <div className="flex items-center gap-2">
                    {t('dashboard.uptime')}
                    {sortKey === 'uptime' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.map((device) => (
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
                      {device.hashrate > 0
                        ? `${device.hashrate.toFixed(2)} ${device.hashrateUnit}`
                        : '—'}
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
                  <td>
                    <span className="text-primary">{device.pool}</span>
                  </td>
                  <td>
                    <span className="text-primary">{device.worker}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-primary">{device.ipAddress}</span>
                  </td>
                  <td>
                    <span className="text-primary">{device.uptime}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown dropdown-end">
                      <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                        <MenuDotsIcon className="w-4 h-4" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
                      >
                        <li>
                          <button>{t('dashboard.viewDetails')}</button>
                        </li>
                        <li>
                          <button>{t('dashboard.rebootDevice')}</button>
                        </li>
                        <li>
                          <button>{t('dashboard.changePools')}</button>
                        </li>
                        <li>
                          <button>{t('dashboard.restartMiner')}</button>
                        </li>
                        <li className="divider"></li>
                        <li>
                          <button>{t('dashboard.viewLogs')}</button>
                        </li>
                        <li>
                          <button className="text-error">{t('dashboard.pauseMining')}</button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-base-300 p-4">
            <p className="text-sm text-primary">
              {t('dashboard.showing')} {startIndex + 1}-{Math.min(endIndex, sortedDevices.length)}{' '}
              {t('dashboard.of')} {sortedDevices.length} {t('dashboard.devices').toLowerCase()}
            </p>
            <div className="join">
              <button
                className="btn btn-sm join-item"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Показываем первую, последнюю, текущую и соседние страницы
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Добавляем многоточие если есть пропуски
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <button className="btn btn-sm join-item" disabled>
                          ...
                        </button>
                      )}
                      <button
                        className={`btn btn-sm join-item ${currentPage === page ? 'btn-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              <button
                className="btn btn-sm join-item"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                »
              </button>
            </div>
          </div>
        )}
        {itemsPerPage === 'all' && (
          <div className="flex items-center justify-between border-t border-base-300 p-4">
            <p className="text-sm text-primary">
              {t('dashboard.showing')} {sortedDevices.length} {t('dashboard.of')}{' '}
              {sortedDevices.length} {t('dashboard.devices').toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesTable;
