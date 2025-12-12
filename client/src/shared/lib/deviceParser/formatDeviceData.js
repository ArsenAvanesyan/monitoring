/**
 * Форматирование данных устройств для отображения в таблице
 * Преобразует распарсенные данные в формат, готовый для отображения
 */

import { parseDeviceData } from './parseDeviceData';
import {
  formatHashrate,
  normalizePcb,
  normalizeSubtype,
  formatTempChip,
  formatFan,
} from './utils';

/**
 * Форматирование данных устройства для таблицы
 * @param {Array<Object>} parsedData - массив распарсенных данных устройств
 * @returns {Array<Object>} отформатированные данные для таблицы
 */
export const formatDeviceData = (parsedData) => {
  if (!parsedData || parsedData.length === 0) return [];

  const subURL = 'stratum+tcp://';

  return parsedData.map((d) => {
    return {
      ip: d.ip || '-',
      status: d.status || '-',
      brand: d.brand || '-',
      blink: Boolean(d.blink),
      type: d.type,
      subtype: d.subtype ? normalizeSubtype(d.subtype) : '-',
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
      rate_30m: d.rate_30m && d.rateUnit ? formatHashrate(Number(d.rate_30m), d.rateUnit) : '-',
      rate_avg: d.rate_avg && d.rateUnit ? formatHashrate(Number(d.rate_avg), d.rateUnit) : '-',
      rateUnit: d.rateUnit,
      fan: formatFan(d.fan),
      temp_chip: formatTempChip(d.temp_chip),
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
};

/**
 * Парсинг и форматирование данных устройств в одном вызове
 * @param {Array<Object>} rawData - массив сырых данных от access.exe
 * @returns {Array<Object>} отформатированные данные для таблицы
 */
export const parseAndFormatDeviceData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];

  const parsed = rawData.map((item) => parseDeviceData(item));
  return formatDeviceData(parsed);
};

