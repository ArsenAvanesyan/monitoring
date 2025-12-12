/**
 * Модуль парсинга и форматирования данных устройств
 * Архитектура: Feature-Sliced Design (FSD) - shared/lib
 */

export { parseDeviceData } from './parseDeviceData';
export { formatDeviceData, parseAndFormatDeviceData } from './formatDeviceData';
export {
  formatHashrate,
  normalizePcb,
  normalizeSubtype,
  formatValue,
  formatTempChip,
  formatFan,
} from './utils';

