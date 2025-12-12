/**
 * Утилиты для парсинга и форматирования данных устройств
 */

/**
 * Форматирование хешрейта
 * @param {number|string} value - значение хешрейта
 * @param {string} unit - единица измерения
 * @returns {string} отформатированный хешрейт
 */
export const formatHashrate = (value, unit) => {
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

/**
 * Нормализация PCB (печатной платы)
 * @param {string} raw - сырое значение PCB
 * @returns {string} нормализованное значение
 */
export const normalizePcb = (raw) => {
  if (!raw) return '-';
  const base = raw.includes('_') ? raw.substring(0, raw.indexOf('_')) : raw;
  if (base.startsWith('CVCtrl')) return 'CV';
  if (base.startsWith('AMLCtrl')) return 'Aml';
  if (base.startsWith('BBCtrl')) return 'BB';
  if (base.toLowerCase().startsWith('zynq')) return 'Zynq';
  return base;
};

/**
 * Нормализация подтипа устройства
 * @param {string} subtype - подтип устройства
 * @returns {string} нормализованный подтип
 */
export const normalizeSubtype = (subtype) => {
  if (!subtype) return '-';
  return subtype.replace(/Ctrl/g, '').replace(/_+$/, '').trim();
};

/**
 * Форматирование значения для отображения в таблице
 * @param {any} value - значение для форматирования
 * @returns {string} отформатированное значение
 */
export const formatValue = (value) => {
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

/**
 * Форматирование температуры чипа
 * @param {Array<number>|string} tempChip - массив температур или строка
 * @returns {string} отформатированная температура
 */
export const formatTempChip = (tempChip) => {
  const temps = Array.isArray(tempChip)
    ? tempChip
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
};

/**
 * Форматирование вентиляторов
 * @param {Array|string} fan - данные о вентиляторах
 * @returns {string} отформатированные данные
 */
export const formatFan = (fan) => {
  if (Array.isArray(fan)) {
    return fan.join(', ');
  }
  if (typeof fan === 'string') {
    return fan;
  }
  return '-';
};

