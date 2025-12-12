import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { convertMinersToDevices } from './utils/minerDataConverter';
import {
  parseDeviceData,
  formatDeviceData,
  formatValue,
} from '../../shared/lib/deviceParser';
import { flattenObject } from '../scan/ScanTable';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import Checkbox from '../ui/Checkbox';
import { useClipboard } from '../../hooks/useToClipboard';
import { compareIp } from '../../utils/ipUtils';
import { confFieldsList, apiFieldsList, firmwareList, serialNumberList } from '../scan/ColumnsModal';
import {
  ChevronDownIcon,
  FilterIcon,
  ExportIcon,
  RefreshIcon,
  AddIcon,
  MenuDotsIcon,
} from '../../svg/icons';

// Компонент для мигающего текста
const BlinkingText = ({ isOn, children }) => {
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    let interval;
    if (isOn) {
      interval = setInterval(() => {
        setIsSuccess((prev) => !prev);
      }, 200);
    } else {
      setIsSuccess(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOn]);

  const cls = isOn ? (isSuccess ? 'text-success' : 'text-error') : 'text-primary';
  return <span className={cls}>{children}</span>;
};

const DevicesTable = ({
  minersData = [],
  lastUpdateTimestamp = null,
  confEnabled = false,
  confFields = [],
  apiEnabled = true,
  apiFields = [],
  firmwareEnabled = true,
  firmwareFields = [],
  user = 'root',
  password = 'root',
}) => {
  const { t } = useTranslation();
  const copy = useClipboard();
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [sortKey, setSortKey] = useState('ip');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState(null);
  const [onlyActiveMiners, setOnlyActiveMiners] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCell, setCopiedCell] = useState(null);

  // Получаем время с момента последнего обновления
  const timeAgo = useTimeAgo(lastUpdateTimestamp);

  // Парсим и форматируем данные устройств
  const devices = useMemo(() => {
    if (!minersData || minersData.length === 0) return [];

    // Парсим сырые данные
    const parsedData = minersData.map((item) => parseDeviceData(item));

    // Форматируем для таблицы
    return formatDeviceData(parsedData);
  }, [minersData]);

  // Исключаемые поля для динамических колонок
  const exclude = new Set([
    ...apiFieldsList.map((f) => f.key),
    ...confFieldsList.map((f) => f.key),
    'alive',
    'alive1',
    'alive2',
    'serialNumber',
    'firmware',
    'blink',
    'active',
    'activation',
    'bVersion',
  ]);

  // Определение колонок
  const columns = useMemo(() => {
    if (!devices.length) {
      // Базовые колонки по умолчанию
      return [
        { key: 'ip', label: t('dashboard.ipAddress') || 'IP' },
        { key: 'brand', label: t('dashboard.deviceModel') || 'Model' },
        { key: 'status', label: t('common.status') || 'Status' },
        { key: 'rate_avg', label: t('devices.hashrate') || 'Hashrate' },
        { key: 'temp_chip', label: t('devices.temperature') || 'Temperature' },
        { key: 'fan', label: t('dashboard.fanSpeed') || 'Fan' },
      ];
    }

    const baseColumns = [
      { key: 'ip', label: t('dashboard.ipAddress') || 'IP' },
      { key: 'brand', label: t('dashboard.deviceModel') || 'Model' },
      { key: 'status', label: t('common.status') || 'Status' },
    ];

    const seen = new Set(baseColumns.map((c) => c.key));
    const dynamicCols = Object.keys(flattenObject(devices[0]))
      .filter((key) => !seen.has(key) && !exclude.has(key))
      .map((key) => {
        let label;
        switch (key) {
          case 'url':
            label = 'API URL';
            break;
          case 'url1':
            label = 'API URL1';
            break;
          case 'url2':
            label = 'API URL2';
            break;
          case 'user':
            label = 'API User';
            break;
          case 'user1':
            label = 'API User1';
            break;
          case 'user2':
            label = 'API User2';
            break;
          case 'rate_avg':
            label = t('devices.hashrate') || 'Hashrate';
            break;
          case 'temp_chip':
            label = t('devices.temperature') || 'Temperature';
            break;
          case 'fan':
            label = t('dashboard.fanSpeed') || 'Fan';
            break;
          default:
            label = key
              .replace(/_/g, ' ')
              .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
        }
        return { key, label };
      });

    const confCols =
      confEnabled || confFields.length > 0
        ? confFieldsList.filter((f) => confFields.includes(f.key))
        : [];

    const apiCols =
      apiEnabled || apiFields.length > 0
        ? apiFieldsList.filter((f) => apiFields.includes(f.key))
        : [];

    const serialCols =
      firmwareEnabled && firmwareFields.includes('serialNumber') ? serialNumberList : [];

    const firmwareCols =
      firmwareEnabled || firmwareFields.length > 0
        ? firmwareList
            .filter((f) => firmwareFields.includes(f.key))
            .filter((f) => f.key !== 'blink')
        : [];

    return [...baseColumns, ...dynamicCols, ...apiCols, ...confCols, ...serialCols, ...firmwareCols];
  }, [devices, t, confEnabled, confFields, apiEnabled, apiFields, firmwareEnabled, firmwareFields]);

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
      setSelectedDevices(new Set(devices.map((d) => d.ip)));
    }
  };

  const handleSelectDevice = (ip) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(ip)) {
      newSelected.delete(ip);
    } else {
      newSelected.add(ip);
    }
    setSelectedDevices(newSelected);
  };

  // Фильтрация и сортировка
  let filteredDevices = devices;
  if (filterStatus) {
    filteredDevices = devices.filter((d) => {
      const status = d.status?.toString() || '';
      return status === filterStatus || (filterStatus === 'online' && (status === '200' || status === 200));
    });
  }
  // Фильтр "Только активные майнеры" (online и degraded)
  if (onlyActiveMiners) {
    filteredDevices = filteredDevices.filter((d) => {
      const status = d.status?.toString() || '';
      return status === '200' || status === 200 || status === 'online' || status === 'degraded' || status === '401' || status === 401;
    });
  }

  // Функция для получения значения для сортировки
  const getSortValue = (device, key) => {
    const flat = flattenObject(device);
    const value = flat[key] ?? '';

    if (key === 'ip') {
      return compareIp(device.ip || '', '');
    }

    if (typeof value === 'number') return value;
    if (typeof value === 'string') return value;
    return String(value);
  };

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);

    if (sortKey === 'ip') {
      return sortDirection === 'asc' ? compareIp(a.ip, b.ip) : compareIp(b.ip, a.ip);
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal, undefined, { numeric: true })
        : bVal.localeCompare(aVal, undefined, { numeric: true });
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
    const statusStr = status?.toString() || '';
    if (statusStr === '200' || statusStr === 200 || statusStr === 'online') {
      return <span className="badge badge-success badge-sm">{t('dashboard.online')}</span>;
    }
    if (statusStr === '401' || statusStr === 401 || statusStr === 'degraded') {
      return <span className="badge badge-warning badge-sm">{t('dashboard.degraded')}</span>;
    }
    if (statusStr === '404' || statusStr === 404 || statusStr === 'offline' || statusStr === '4') {
      return <span className="badge badge-error badge-sm">{t('dashboard.offline')}</span>;
    }
    return <span className="badge badge-ghost badge-sm">{statusStr}</span>;
  };

  const copyable = [
    'url',
    'user',
    'url1',
    'user1',
    'url2',
    'user2',
    'chainSN',
    'confUrl1',
    'confUrl2',
    'confUrl3',
    'confUser1',
    'confUser2',
    'confUser3',
    'hfUrl1',
    'hfUrl2',
    'hfUrl3',
    'hfUser1',
    'hfUser2',
    'hfUser3',
    'serialNumber',
    'bVersion',
  ];

  const getUrlColorClass = (key, aliveVal) => {
    if (!key.startsWith('url')) return '';
    const val = String(aliveVal).toLowerCase();
    const aliveStatuses = ['true', 'alive', 'in use', 'active', '1'];
    const deadStatuses = ['false', 'dead', '-1', '0'];
    if (aliveStatuses.includes(val)) return 'text-success';
    if (deadStatuses.includes(val)) return 'text-error';
    return 'text-gray-500';
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
            {/* Таймер последнего обновления */}
            {lastUpdateTimestamp && timeAgo && (
              <div className="text-sm text-primary/70">
                {t('dashboard.lastUpdate')} {timeAgo.value} {t(`dashboard.timeUnits.${timeAgo.unit}`, { count: timeAgo.value })} {t('dashboard.ago')}
              </div>
            )}
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
                  <Checkbox
                    color="info"
                    rounded="md"
                    className="h-5 w-5"
                    checked={selectedDevices.size === devices.length && devices.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer text-primary"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortKey === col.key && (sortDirection === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.map((device) => {
                const flat = flattenObject(device);
                const statusStr = device.status?.toString() || '';
                const isOffline = statusStr === '404' || statusStr === 404 || statusStr === 'offline' || statusStr === '4';

                return (
                  <tr
                    key={device.ip}
                    className={`hover ${isOffline ? 'opacity-60' : ''}`}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        color="info"
                        rounded="md"
                        className="h-5 w-5"
                        checked={selectedDevices.has(device.ip)}
                        onChange={() => handleSelectDevice(device.ip)}
                      />
                    </td>
                    {columns.map((col) => {
                      const v = flat[col.key];

                      // IP link с поддержкой blink
                      if (col.key === 'ip') {
                        const isBlink = Boolean(flat.blink);
                        const isBlinkEnabled = firmwareFields.includes('blink');
                        return (
                          <td
                            key={col.key}
                            className="cursor-pointer ip-link font-mono text-xs text-primary hover:underline decoration-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `http://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${v}/`;
                              window.open(url, '_blank');
                            }}
                          >
                            {isBlink && isBlinkEnabled ? (
                              <BlinkingText isOn={isBlink}>{String(v || '-')}</BlinkingText>
                            ) : (
                              String(v || '-')
                            )}
                          </td>
                        );
                      }

                      // Status badge
                      if (col.key === 'status') {
                        return <td key={col.key}>{getStatusBadge(device.status)}</td>;
                      }

                      // Copyable cells
                      if (copyable.includes(col.key)) {
                        const cellId = `${device.ip}-${col.key}`;
                        const isUrl = col.key.startsWith('url');
                        let urlColorClass = '';

                        if (isUrl) {
                          const aliveKey =
                            col.key === 'url'
                              ? 'alive'
                              : col.key === 'url1'
                                ? 'alive1'
                                : 'alive2';
                          urlColorClass = getUrlColorClass(col.key, flat[aliveKey]);
                        }

                        return (
                          <td
                            key={col.key}
                            className={`relative copyable-cell px-2 py-1 whitespace-nowrap cursor-pointer ${
                              copiedCell === cellId
                                ? 'underline decoration-primary'
                                : 'hover:underline decoration-info'
                            } ${urlColorClass}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              copy(String(v ?? ''));
                              setCopiedCell(cellId);
                              setTimeout(() => setCopiedCell(null), 800);
                            }}
                            title={String(v ?? '-')}
                          >
                            {formatValue(v)}
                            {copiedCell === cellId && (
                              <div className="absolute z-20 top-1 left-1/2 transform -translate-x-1/2 -translate-y-full p-2 bg-info text-success-content text-xs rounded shadow-lg whitespace-nowrap">
                                {t('additional.copied') || 'Скопировано'}
                              </div>
                            )}
                          </td>
                        );
                      }

                      // Work Mode
                      if (col.key === 'workMode') {
                        const workModeValue = String(v);
                        let displayValue;
                        if (workModeValue === '0' || workModeValue === '2') {
                          displayValue = t('action.onOff') || 'On/Off';
                        } else if (workModeValue === '1') {
                          displayValue = t('action.offOn') || 'Off/On';
                        } else {
                          displayValue = formatValue(v);
                        }
                        return (
                          <td key={col.key} className="px-2 py-1 whitespace-nowrap">
                            {displayValue}
                          </td>
                        );
                      }

                      // Freq Mode
                      if (col.key === 'freqMode') {
                        const freqModeValue = String(v);
                        let displayValue;
                        if (freqModeValue === '0') {
                          displayValue = t('tools.table.workModeGeneral') || 'General';
                        } else if (freqModeValue === '1') {
                          displayValue = t('tools.table.workModeBoard') || 'Board';
                        } else {
                          displayValue = formatValue(v);
                        }
                        return (
                          <td key={col.key} className="px-2 py-1 whitespace-nowrap">
                            {displayValue}
                          </td>
                        );
                      }

                      // Temperature с индикатором
                      if (col.key === 'temp_chip') {
                        const tempValue = String(v);
                        const tempNum = parseFloat(tempValue.split('/')[0]) || 0;
                        return (
                          <td key={col.key} className="px-2 py-1 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-primary">{formatValue(v)}</span>
                              {tempNum > 75 && (
                                <span className="h-2 w-2 rounded-full bg-warning"></span>
                              )}
                            </div>
                          </td>
                        );
                      }

                      // Default rendering
                      return (
                        <td
                          key={col.key}
                          title={String(v ?? '-')}
                          className="px-2 py-1 whitespace-nowrap text-primary"
                        >
                          {formatValue(v)}
                        </td>
                      );
                    })}
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
                );
              })}
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
