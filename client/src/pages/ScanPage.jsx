import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ScanTable from '../components/scan/ScanTable';
import ColumnsModal from '../components/scan/ColumnsModal';
import Checkbox from '../components/ui/Checkbox';
import { parseDeviceData } from '../utils/parseDeviceData';
import accessService from '../services/accessService';
import { apiFieldsList } from '../components/scan/ColumnsModal';

// Функция для форматирования хешрейта
const formatHashrate = (value, unit) => {
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

// Нормализация типа
const normalizeType = (raw) => {
  if (!raw) return '';
  return raw
    .replace('Antminer ', '')
    .replace(/\(.*\)/, '')
    .trim();
};

// Нормализация PCB
const normalizePcb = (raw) => {
  if (!raw) return '-';
  const base = raw.includes('_') ? raw.substring(0, raw.indexOf('_')) : raw;
  if (base.startsWith('CVCtrl')) return 'CV';
  if (base.startsWith('AMLCtrl')) return 'Aml';
  if (base.startsWith('BBCtrl')) return 'BB';
  if (base.toLowerCase().startsWith('zynq')) return 'Zynq';
  return base;
};

const ScanPage = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('root');
  const [onlySuccess, setOnlySuccess] = useState(true);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['all']);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [selectedPcbs, setSelectedPcbs] = useState(['all']);

  // Настройки колонок из localStorage
  const [apiEnabled, setApiEnabled] = useState(() => {
    const stored = localStorage.getItem('apiEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  const [apiFields, setApiFields] = useState(() => {
    const stored = localStorage.getItem('apiFields');
    if (stored) return JSON.parse(stored);
    return apiFieldsList
      .map((f) => f.key)
      .filter(
        (key) =>
          !['fan', 'chain_num', 'chainSN', 'rate_30m', 'brand', 'subtype'].includes(key)
      );
  });

  const [confEnabled, setConfEnabled] = useState(() => {
    const stored = localStorage.getItem('confEnabled');
    return stored !== null ? JSON.parse(stored) : false;
  });

  const [confFields, setConfFields] = useState(() => {
    const stored = localStorage.getItem('confFields');
    return stored ? JSON.parse(stored) : [];
  });

  const [firmwareEnabled, setFirmwareEnabled] = useState(() => {
    const stored = localStorage.getItem('firmwareEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  const [firmwareFields, setFirmwareFields] = useState(() => {
    const stored = localStorage.getItem('firmwareFields');
    return stored ? JSON.parse(stored) : ['serialNumber', 'bVersion', 'blink'];
  });

  // Сохранение настроек в localStorage
  useEffect(() => {
    localStorage.setItem('apiEnabled', JSON.stringify(apiEnabled));
  }, [apiEnabled]);

  useEffect(() => {
    localStorage.setItem('apiFields', JSON.stringify(apiFields));
  }, [apiFields]);

  useEffect(() => {
    localStorage.setItem('confEnabled', JSON.stringify(confEnabled));
  }, [confEnabled]);

  useEffect(() => {
    localStorage.setItem('confFields', JSON.stringify(confFields));
  }, [confFields]);

  useEffect(() => {
    localStorage.setItem('firmwareEnabled', JSON.stringify(firmwareEnabled));
  }, [firmwareEnabled]);

  useEffect(() => {
    localStorage.setItem('firmwareFields', JSON.stringify(firmwareFields));
  }, [firmwareFields]);

  // Загрузка данных из API
  const fetchData = async () => {
    try {
      const response = await accessService.getLastData();
      console.log('📥 Ответ от сервера:', response);

      let dataToUse = [];
      if (response && response.allData && Array.isArray(response.allData)) {
        dataToUse = response.allData;
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          dataToUse = response.data;
        } else {
          dataToUse = [response.data];
        }
      }

      // Парсим данные
      const parsedData = dataToUse.map((item) => parseDeviceData(item));

      // Преобразуем в формат для таблицы
      const formattedData = parsedData.map((d) => {
        const subURL = 'stratum+tcp://';
        return {
          ip: d.ip || '-',
          status: d.status || '-',
          brand: d.brand || '-',
          blink: Boolean(d.blink),
          type: d.type,
          subtype: d.subtype
            ? d.subtype.replace(/Ctrl/g, '').replace(/_+$/, '').trim()
            : '-',
          pcb: d.pcb ? normalizePcb(d.pcb) : '-',
          activation: d.active,
          alive: d.alive,
          url: d.url?.replace(subURL, ''),
          user: d.user,
          alive1: d.alive1,
          url1: d.url1?.replace(subURL, ''),
          user1: d.user1,
          alive2: d.alive2,
          url2: d.url2?.replace(subURL, ''),
          user2: d.user2,
          chain_num: d.chain_num,
          asic_num: d.asic_num,
          elapsed: d.elapsed,
          compileTime: d.compileTime || '-',
          chainSN: d.chainSN,
          rate_5s: d.rate_5s && d.rateUnit ? formatHashrate(Number(d.rate_5s), d.rateUnit) : '-',
          rate_30m:
            d.rate_30m && d.rateUnit ? formatHashrate(Number(d.rate_30m), d.rateUnit) : '-',
          rate_avg: d.rate_avg && d.rateUnit ? formatHashrate(Number(d.rate_avg), d.rateUnit) : '-',
          rateUnit: d.rateUnit,
          fan: Array.isArray(d.fan) ? d.fan.join(', ') : typeof d.fan === 'string' ? d.fan : '-',
          temp_chip: (() => {
            const temps = Array.isArray(d.temp_chip)
              ? d.temp_chip
                  .map((v) => Number(v))
                  .filter((n) => !isNaN(n))
              : [];

            if (temps.length < 4) {
              return '-';
            }

            const groupMaxes = [];
            for (let i = 0; i + 3 < temps.length; i += 4) {
              const slice = temps.slice(i, i + 4);
              const inMax = Math.max(slice[0], slice[1]);
              const outMax = Math.max(slice[2], slice[3]);
              groupMaxes.push(Math.max(inMax, outMax));
            }

            return groupMaxes.join('/');
          })(),
          targetVoltage: Number(d.targetVoltage),
          freqLevel: d.freqLevel,
          freqMode: d.freqMode,
          workMode: d.workMode,
          targetTemp: d.targetTemp,
          confUrl1: d.confUrl1,
          confUrl2: d.confUrl2,
          confUrl3: d.confUrl3,
          confUser1: d.confUser1,
          confUser2: d.confUser2,
          confUser3: d.confUser3,
          fanCtrl: d.fanCtrl,
          fanPWM: d.fanPWM,
          ignoreFan: d.ignoreFan,
          fanLimit: d.fanLimit,
          hfCtrl: d.hfCtrl,
          hfPercent: d.hfPercent,
          hfUrl1: d.hfUrl1,
          hfUrl2: d.hfUrl2,
          hfUrl3: d.hfUrl3,
          hfUser1: d.hfUser1,
          hfUser2: d.hfUser2,
          hfUser3: d.hfUser3,
          fchain0: d.fchain0,
          fchain1: d.fchain1,
          fchain2: d.fchain2,
          serialNumber: d.serialNumber || '-',
          firmware: d.firmware || '-',
          bVersion: d.bVersion || '-',
          scheduleCtrl: d.scheduleCtrl,
          scheduleStart1: d.scheduleStart1,
          scheduleStop1: d.scheduleStop1,
          scheduleWeekChoice1: d.scheduleWeekChoice1,
          scheduleStart2: d.scheduleStart2,
          scheduleStop2: d.scheduleStop2,
          scheduleWeekChoice2: d.scheduleWeekChoice2,
          scheduleStart3: d.scheduleStart3,
          scheduleStop3: d.scheduleStop3,
          scheduleWeekChoice3: d.scheduleWeekChoice3,
          scheduleStart4: d.scheduleStart4,
          scheduleStop4: d.scheduleStop4,
          scheduleWeekChoice4: d.scheduleWeekChoice4,
          scheduleStart5: d.scheduleStart5,
          scheduleStop5: d.scheduleStop5,
          scheduleWeekChoice5: d.scheduleWeekChoice5,
        };
      });

      setTableData(formattedData);
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных:', error);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Обновление каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  // Фильтрация данных
  const combinedData = useMemo(() => {
    let filtered = onlySuccess
      ? tableData.filter((d) => d.brand?.toLowerCase() !== 'no data')
      : tableData;

    if (!selectedTypes.includes('all')) {
      filtered = filtered.filter((d) => selectedTypes.includes(normalizeType(d.type)));
    }

    if (!selectedBrands.includes('all')) {
      filtered = filtered.filter((d) => selectedBrands.includes(d.brand || ''));
    }

    if (!selectedPcbs.includes('all')) {
      filtered = filtered.filter((d) => {
        const normalizedPcb = d.pcb ? normalizePcb(d.pcb) : 'unknown';
        return selectedPcbs.includes(normalizedPcb);
      });
    }

    if (userFilter.trim()) {
      filtered = filtered.filter((d) =>
        d.user?.toLowerCase().includes(userFilter.trim().toLowerCase())
      );
    }

    return filtered;
  }, [tableData, onlySuccess, selectedTypes, userFilter, selectedBrands, selectedPcbs]);

  const handleSelectIP = (ip) => {
    setSelectedIPs((prev) => (prev.includes(ip) ? prev.filter((item) => item !== ip) : [...prev, ip]));
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      const allIPs = combinedData.map((item) => item.ip);
      setSelectedIPs(allIPs);
    } else {
      setSelectedIPs([]);
    }
    setSelectAll(!selectAll);
  };

  const typesList = useMemo(() => {
    const uniq = Array.from(
      new Set(combinedData.map((d) => normalizeType(d.type)))
    ).filter((t) => t && t.toLowerCase() !== 'unknown');
    return ['all', ...uniq];
  }, [combinedData]);

  const brandsList = useMemo(() => {
    return ['all', ...new Set(combinedData.map((d) => d.brand).filter((b) => b))];
  }, [combinedData]);

  const pcbsList = useMemo(() => {
    const uniquePcbs = combinedData
      .map((d) => (d.pcb ? normalizePcb(d.pcb) : '-'))
      .filter((p, i, arr) => p && arr.indexOf(p) === i);

    return ['all', ...uniquePcbs];
  }, [combinedData]);

  const scanStats = useMemo(() => {
    const successCount = combinedData.filter(
      (item) => !['no data'].includes(item.brand?.toLowerCase() ?? '')
    ).length;

    return {
      totalScanned: tableData.length,
      successCount,
      selectedCount: selectedIPs.length,
    };
  }, [combinedData, selectedIPs, tableData.length]);

  return (
    <div className="p-4">
      <div className="max-w-full mx-auto">
        {/* Заголовок и кнопки */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">
            {t('scan.title') || 'Сканирование устройств'}
          </h1>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => fetchData()}
            >
              {t('scan.refresh') || 'Обновить'}
            </button>
            <button
              className="btn btn-info"
              onClick={() => setIsColumnsModalOpen(true)}
            >
              {t('scan.filterColumns') || 'Фильтр колонок'}
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="border border-primary bg-base-200 w-full rounded-lg mb-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-1 text-primary">
            <div className="flex items-center">
              <Checkbox
                id="successOnly"
                color="info"
                rounded="md"
                checked={onlySuccess}
                onChange={() => setOnlySuccess(!onlySuccess)}
              />
              <label htmlFor="successOnly" className="pl-2">
                {t('scan.onlySuccess') || 'Только успешные'}
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder={t('scan.filterByUser') || 'Фильтр по пользователю'}
                className="input input-bordered input-sm w-full max-w-xs"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>

            {/* Фильтры по типам, брендам, PCB */}
            <div className="flex gap-2">
              <select
                className="select select-bordered select-sm"
                value={selectedTypes[0]}
                onChange={(e) => setSelectedTypes([e.target.value])}
              >
                {typesList.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? t('scan.allTypes') || 'Все типы' : type}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered select-sm"
                value={selectedBrands[0]}
                onChange={(e) => setSelectedBrands([e.target.value])}
              >
                {brandsList.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === 'all' ? t('scan.allBrands') || 'Все бренды' : brand}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered select-sm"
                value={selectedPcbs[0]}
                onChange={(e) => setSelectedPcbs([e.target.value])}
              >
                {pcbsList.map((pcb) => (
                  <option key={pcb} value={pcb}>
                    {pcb === 'all' ? t('scan.allPcbs') || 'Все PCB' : pcb}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="flex justify-start gap-4 px-4 py-2 mb-4 bg-base-200 border border-primary rounded-lg text-primary">
          <div className="text-sm">
            {t('scan.totalScanned') || 'Всего отсканировано'}: {scanStats.totalScanned}
          </div>
          <div className="text-sm">
            {t('scan.success') || 'Успешно'}: {scanStats.successCount}
          </div>
          <div className="text-sm">
            {t('scan.selected') || 'Выбрано'}: {scanStats.selectedCount}
          </div>
        </div>

        {/* Таблица */}
        <div className="border border-primary bg-base-200 w-full rounded-lg">
          <div className="h-[80vh] flex flex-col min-h-[80vh] bg-base-100 rounded-b-lg">
            <ScanTable
              tableData={combinedData}
              selectedIPs={selectedIPs}
              onSelectIP={handleSelectIP}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
              user={user}
              password={password}
              confEnabled={confEnabled}
              confFields={confFields}
              apiEnabled={apiEnabled}
              apiFields={apiFields}
              firmwareEnabled={firmwareEnabled}
              firmwareFields={firmwareFields}
            />
          </div>
        </div>

        {/* Модальное окно фильтра колонок */}
        <ColumnsModal
          isOpen={isColumnsModalOpen}
          onClose={() => setIsColumnsModalOpen(false)}
          apiEnabled={apiEnabled}
          setApiEnabled={setApiEnabled}
          apiFields={apiFields}
          setApiFields={setApiFields}
          confEnabled={confEnabled}
          setConfEnabled={setConfEnabled}
          confFields={confFields}
          setConfFields={setConfFields}
          firmwareEnabled={firmwareEnabled}
          setFirmwareEnabled={setFirmwareEnabled}
          firmwareFields={firmwareFields}
          setFirmwareFields={setFirmwareFields}
        />
      </div>
    </div>
  );
};

export default ScanPage;

