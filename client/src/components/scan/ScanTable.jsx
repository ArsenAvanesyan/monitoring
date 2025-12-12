import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '../ui/Checkbox';
import { useClipboard } from '../../hooks/useToClipboard';
import { compareIp } from '../../utils/ipUtils';
import { confFieldsList, apiFieldsList, firmwareList, serialNumberList } from './ColumnsModal';

// Функция для "сплющивания" объекта
export const flattenObject = (obj) => {
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.keys(obj[key]).forEach((subKey) => {
        const newKey = `${key}_${subKey}`;
        if (!flattened.hasOwnProperty(newKey)) {
          flattened[newKey] = obj[key][subKey];
        }
      });
    } else if (!flattened.hasOwnProperty(key)) {
      flattened[key] = obj[key];
    }
  });
  return flattened;
};

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

// Форматирование значения
const formatValue = (value) => {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) {
    return value.map((v) => (v == null ? '-' : String(v))).join(', ');
  }
  if (typeof value === 'number') return isNaN(value) ? '-' : value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

// Форматирование хешрейта
const formatHashrate = (value, unit) => {
  if (!value || !unit) return '-';
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s'];
  let unitIndex = units.indexOf(unit);
  if (unitIndex === -1) return `${value} ${unit}`;

  let currentValue = Number(value);
  while (currentValue >= 1000 && unitIndex < units.length - 1) {
    currentValue /= 1000;
    unitIndex++;
  }

  const formattedValue = Number.isInteger(currentValue)
    ? currentValue.toFixed(0)
    : currentValue.toFixed(2);

  return `${formattedValue} ${units[unitIndex]}`;
};

const ScanTable = ({
  tableData = [],
  selectedIPs = [],
  onSelectIP,
  selectAll,
  onSelectAll,
  user = 'root',
  password = 'root',
  confEnabled = false,
  confFields = [],
  apiEnabled = true,
  apiFields = [],
  firmwareEnabled = true,
  firmwareFields = [],
}) => {
  const { t } = useTranslation();
  const copy = useClipboard();
  const [sortBy, setSortBy] = useState('ip');
  const [sortDirection, setSortDirection] = useState('asc');
  const [copiedCell, setCopiedCell] = useState(null);

  // Исключаемые поля
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
    if (!tableData.length) return [];

    const baseColumns = [{ key: 'ip', label: t('IP') || 'IP' }, { key: 'status', label: t('Status') || 'Status' }];

    const seen = new Set(baseColumns.map((c) => c.key));
    const dynamicCols = Object.keys(flattenObject(tableData[0]))
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
  }, [tableData, t, confEnabled, confFields, apiEnabled, apiFields, firmwareEnabled, firmwareFields]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    return [...tableData].sort((a, b) => {
      const flatA = flattenObject(a);
      const flatB = flattenObject(b);
      const fa = flatA[sortBy] ?? '';
      const fb = flatB[sortBy] ?? '';

      if (sortBy === 'ip') {
        return sortDirection === 'asc' ? compareIp(a.ip, b.ip) : compareIp(b.ip, a.ip);
      }

      return sortDirection === 'asc'
        ? String(fa).localeCompare(String(fb), undefined, { numeric: true })
        : String(fb).localeCompare(String(fa), undefined, { numeric: true });
    });
  }, [tableData, sortBy, sortDirection]);

  const handleSort = (key) => {
    if (key === 'blink') return;

    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
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

  return (
    <div className="flex-1 relative">
      <div className="absolute inset-0 flex flex-col">
        <div className="overflow-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-base-100">
          <table className="table relative w-full">
            <thead className="sticky top-0 z-10 bg-base-100">
              <tr>
                <th className="sticky z-30 bg-base-100 whitespace-nowrap w-[20px]">
                  <Checkbox
                    color="info"
                    rounded="md"
                    className="h-6 w-6"
                    checked={selectAll}
                    onChange={onSelectAll}
                  />
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="sticky top-0 z-20 bg-base-100 cursor-pointer text-primary px-1 py-0 whitespace-nowrap"
                    onClick={() => handleSort(c.key)}
                  >
                    {c.label}
                    {sortBy === c.key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => {
                const flat = flattenObject(row);
                return (
                  <tr
                    key={row.ip}
                    className="cursor-pointer hover:bg-base-200 text-primary"
                    onClick={(e) => {
                      const tgt = e.target;
                      if (tgt.closest('.ip-link') || tgt.closest('.copyable-cell')) return;
                      onSelectIP(row.ip);
                    }}
                  >
                    <td className="px-1 py-1 whitespace-nowrap">
                      <Checkbox
                        color="info"
                        width={15}
                        height={15}
                        rounded="xl"
                        className="mt-1"
                        checked={selectedIPs.includes(row.ip)}
                        onChange={() => onSelectIP(row.ip)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    {columns.map((c) => {
                      const v = flat[c.key];

                      // IP link
                      if (c.key === 'ip') {
                        const isBlink = Boolean(flat.blink);
                        const isBlinkEnabled = firmwareFields.includes('blink');

                        return (
                          <td
                            key={c.key}
                            className="cursor-pointer ip-link px-1 py-1 whitespace-nowrap hover:underline decoration-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `http://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${v}/`;
                              window.open(url, '_blank');
                            }}
                          >
                            {isBlink && isBlinkEnabled ? (
                              <BlinkingText isOn={isBlink}>{String(v)}</BlinkingText>
                            ) : (
                              String(v)
                            )}
                          </td>
                        );
                      }

                      // Copyable cells
                      if (copyable.includes(c.key)) {
                        const cellId = `${row.ip}-${c.key}`;
                        const isUrl = c.key.startsWith('url');
                        let urlColorClass = '';

                        if (isUrl) {
                          const aliveKey =
                            c.key === 'url'
                              ? 'alive'
                              : c.key === 'url1'
                                ? 'alive1'
                                : 'alive2';
                          urlColorClass = getUrlColorClass(c.key, flat[aliveKey]);
                        }

                        return (
                          <td
                            key={c.key}
                            className={`relative copyable-cell px-1 py-0 whitespace-nowrap cursor-pointer ${
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
                      if (c.key === 'workMode') {
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
                          <td key={c.key} className="px-1 py-1 whitespace-nowrap">
                            {displayValue}
                          </td>
                        );
                      }

                      // Freq Mode
                      if (c.key === 'freqMode') {
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
                          <td key={c.key} className="px-1 py-1 whitespace-nowrap">
                            {displayValue}
                          </td>
                        );
                      }

                      // Хешрейты с форматированием
                      if (c.key === 'rate_5s' || c.key === 'rate_30m' || c.key === 'rate_avg') {
                        const rateValue = flat[c.key];
                        const rateUnit = flat.rateUnit;
                        return (
                          <td key={c.key} className="px-1 py-1 whitespace-nowrap">
                            {formatHashrate(rateValue, rateUnit)}
                          </td>
                        );
                      }

                      // Firmware - специальное форматирование
                      if (c.key === 'firmware') {
                        const fullValue = String(v ?? '-');
                        const displayValue =
                          fullValue.length > 8
                            ? `${fullValue.substring(0, 4)}...${fullValue.substring(fullValue.length - 4)}`
                            : fullValue;

                        return (
                          <td
                            key={c.key}
                            title={fullValue}
                            className="px-2 py-1 whitespace-nowrap cursor-pointer hover:underline decoration-info"
                            onClick={(e) => {
                              e.stopPropagation();
                              copy(fullValue);
                              const cellId = `${row.ip}-${c.key}`;
                              setCopiedCell(cellId);
                              setTimeout(() => setCopiedCell(null), 800);
                            }}
                          >
                            {displayValue}
                            {copiedCell === `${row.ip}-${c.key}` && (
                              <div className="absolute z-20 top-1 left-1/2 transform -translate-x-1/2 -translate-y-full p-2 bg-info text-success-content text-xs rounded shadow-lg whitespace-nowrap">
                                {t('additional.copied') || 'Скопировано'}
                              </div>
                            )}
                          </td>
                        );
                      }

                      // Default rendering
                      return (
                        <td
                          key={c.key}
                          title={String(v ?? '-')}
                          className="px-2 py-1 whitespace-nowrap"
                        >
                          {formatValue(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScanTable;

