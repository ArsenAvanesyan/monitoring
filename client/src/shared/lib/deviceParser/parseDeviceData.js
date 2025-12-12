/**
 * Парсинг данных сканирования устройств
 * Преобразует сырые данные от access.exe в стандартизированный формат
 */

/**
 * Форматирование времени работы устройства
 * @param {number} ms - время в миллисекундах
 * @returns {string} отформатированное время
 */
const formatElapsedTime = (ms) => {
  if (!ms || isNaN(ms)) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Парсинг данных устройства
 * @param {Object} data - сырые данные от access.exe
 * @returns {Object} стандартизированные данные устройства
 */
export const parseDeviceData = (data) => {
  if (!data.dtype || (data.dtype === 'unknow' && !data.stats && !data.devs)) {
    return { ip: data.ip, brand: 'No Data', status: data.st?.toString() };
  }

  const dtype = data.dtype || 'std';
  const result = { ip: data.ip };

  switch (dtype) {
    case 'std': {
      const statsEntry = data.stats?.STATS?.[0] ?? {};
      const summEntry = data.summ?.SUMMARY?.[0] ?? {};

      const getStr = (obj, lower, upper) =>
        obj?.[lower] || obj?.[upper] || '-';

      result.brand = (data.mtype?.miner_type || data.stats?.INFO?.type)?.split(' ')[0] ?? '-';
      result.type = ((data.mtype?.miner_type || data.stats?.INFO?.type) || '')
        .replace(result.brand, '')
        .trim() || data.stats?.INFO?.type || '-';

      result.subtype = data.mtype?.subtype || '-';
      result.compileTime = data.stats?.INFO?.CompileTime;
      result.active = data?.mtype?.vActive || '-';

      result.rate_5s = summEntry.rate_5s?.toString() ?? '0';
      result.rate_30m = summEntry.rate_30m?.toString() ?? '0';
      result.rate_avg = summEntry.rate_avg?.toString() ?? '0';
      result.rateUnit = summEntry.rate_unit?.toString() ?? '';

      result.fan = Array.isArray(statsEntry.fan)
        ? statsEntry.fan.join(', ')
        : '-';
      result.temp_chip = Array.isArray(statsEntry.chain)
        ? statsEntry.chain.flatMap((c) => c.temp_chip || [])
        : [];

      result.pcb = data.mtype?.subtype ?? '-';

      const poolsArr = Array.isArray(data.pools?.POOLS)
        ? data.pools.POOLS
        : [];

      result.pools = poolsArr.map((p) => ({
        url: getStr(p, 'url', 'URL'),
        accepted: Number(p.accepted ?? p.Accepted ?? 0),
        rejected: Number(p.rejected ?? p.Rejected ?? 0),
      }));

      result.url = getStr(poolsArr[0], 'url', 'URL');
      result.user = getStr(poolsArr[0], 'user', 'User');
      result.alive = getStr(poolsArr[0], 'status', 'Status');

      result.url1 = getStr(poolsArr[1], 'url', 'URL');
      result.user1 = getStr(poolsArr[1], 'user', 'User');
      result.alive1 = getStr(poolsArr[1], 'status', 'Status');

      result.url2 = getStr(poolsArr[2], 'url', 'URL');
      result.user2 = getStr(poolsArr[2], 'user', 'User');
      result.alive2 = getStr(poolsArr[2], 'status', 'Status');

      result.chain_num = statsEntry.chain_num;
      if (Array.isArray(statsEntry.chain)) {
        result.asic_num = statsEntry.chain
          .map((c) => c.asic_num?.toString() || '0')
          .join('/');
        result.chainSN = statsEntry.chain
          .map((c) => c.sn?.toString() || '0')
          .join('/');
      }

      result.status = data.st;
      result.elapsed = formatElapsedTime(summEntry.elapsed ?? 0);

      result.freqMode = data.conf?.['freq-mode'] ?? '-';
      result.workMode = data.conf?.['bitmain-work-mode'] ?? '-';
      result.freqLevel = data.conf?.['bitmain-freq-level'] ?? '-';
      result.targetVoltage = data.conf?.['target-voltage'] != null
        ? data.conf['target-voltage'] / 100
        : undefined;
      result.targetTemp = data.conf?.['target-temp'] ?? '-';

      result.confUrl1 = data.conf?.pools[0]?.url ?? '-';
      result.confUrl2 = data.conf?.pools[1]?.url ?? '-';
      result.confUrl3 = data.conf?.pools[2]?.url ?? '-';

      result.confUser1 = data.conf?.pools[0]?.user ?? '-';
      result.confUser2 = data.conf?.pools[1]?.user ?? '-';
      result.confUser3 = data.conf?.pools[2]?.user ?? '-';

      result.fanCtrl = data.conf?.['bitmain-fan-ctrl'] ?? '-';
      result.fanPWM = data.conf?.['bitmain-fan-pwm'] ?? '-';
      result.ignoreFan = data.conf?.['ignore-fan'] ?? '-';
      result.fanLimit = data.conf?.['fan-limit'] ?? '-';

      result.fchain0 = data.conf?.fchain0 ?? '-';
      result.fchain1 = data.conf?.fchain1 ?? '-';
      result.fchain2 = data.conf?.fchain2 ?? '-';

      result.hfCtrl = data.conf?.['hf-ctrl'] ?? '-';
      result.hfPercent = data.conf?.['hf-percent'] ?? '-';
      result.hfUrl1 = data.conf?.['hf-url0'] ?? '-';
      result.hfUrl2 = data.conf?.['hf-url1'] ?? '-';
      result.hfUrl3 = data.conf?.['hf-url2'] ?? '-';
      result.hfUser1 = data.conf?.['hf-user0'] ?? '-';
      result.hfUser2 = data.conf?.['hf-user1'] ?? '-';
      result.hfUser3 = data.conf?.['hf-user2'] ?? '-';

      result.serialNumber = data.mtype?.sn || '-';
      result.firmware = data.mtype?.snfw || '-';
      result.bVersion = data.mtype?.bVersion || '-';

      if (typeof data.blink !== 'undefined' && data.blink !== null) {
        result.blink = Boolean(data.blink);
      }

      if (typeof data.conf?.['schedule-ctrl'] !== 'undefined') {
        result.scheduleCtrl = Boolean(data.conf['schedule-ctrl']);
      }
      for (let i = 1; i <= 5; i++) {
        const scheduleStart = data.conf?.[`schedule-start${i}`];
        const scheduleStop = data.conf?.[`schedule-stop${i}`];
        const scheduleWeek = data.conf?.[`schedule-week-choice${i}`];
        const scheduleCtrl = data.conf?.[`schedule-ctrl${i === 1 ? '' : i}`];

        if (scheduleStart != null && scheduleStart !== '') {
          result[`scheduleStart${i}`] = String(scheduleStart);
        }
        if (scheduleStop != null && scheduleStop !== '') {
          result[`scheduleStop${i}`] = String(scheduleStop);
        }
        if (scheduleWeek != null && scheduleWeek !== '') {
          result[`scheduleWeekChoice${i}`] = String(scheduleWeek);
        }
        if (typeof scheduleCtrl !== 'undefined') {
          result[`scheduleCtrl${i === 1 ? '' : i}`] = Boolean(scheduleCtrl);
        }
      }

      break;
    }

    case 'unknow': {
      const statsEntry = data.stats?.STATS?.[0] || {};
      const devEntry = data.devs?.DEVS?.[0] || {};
      const summaryEntry = data.summ?.SUMMARY?.[0] || {};
      result.brand = data.dtype || 'unknow';

      const summary = data.summ || {};

      result.type = statsEntry.Type || statsEntry.ID || devEntry.Name || summary.miner || summaryEntry.miner || 'Unknown';
      result.compileTime = statsEntry.CompileTime || data.stats?.INFO?.CompileTime;

      const getRate = (keys) => {
        for (const k of keys) {
          if (k.startsWith('GHS')) {
            if (summaryEntry[k] != null) {
              return Number(summaryEntry[k]).toFixed(1);
            }
            if (summary[k] != null) {
              return Number(summary[k]).toFixed(1);
            }
            if (devEntry[k] != null) {
              return Number(devEntry[k]).toFixed(1);
            }
          } else {
            if (summary[k] != null) {
              return Number(summary[k] / 1000000).toFixed(1);
            }
            if (summaryEntry[k] != null) {
              return Number(summaryEntry[k] / 1000000).toFixed(1);
            }
            if (devEntry[k] != null) {
              return Number(devEntry[k] / 1000000).toFixed(1);
            }
          }
        }
        return '0.0';
      };

      result.rate_5s = summary.rt || data.summ?.rt || getRate(['GHS 5s', 'MHS 30s', 'MHS 20s', 'MHS 5s']);
      result.rate_30m = getRate(['GHS 30m', 'MHS 15m', 'MHS 5m', 'MHS 30m']);
      result.rate_avg = summary.avg || data.summ?.avg || getRate(['GHS av', 'MHS av', 'MHS 1m', 'MHS 5m']);
      result.rateUnit = 'MH/s';

      const fan1 = statsEntry.Fan1 ?? statsEntry.fan0 ?? 0;
      const fan2 = statsEntry.Fan2 ?? statsEntry.fan1 ?? 0;
      result.fan = [fan1, fan2].filter((v) => v).join(', ');

      const tmax = statsEntry.TMax ?? statsEntry['tstemp-0'] ?? summary.temp_max ?? data.summ?.temp_max ?? summaryEntry.temp_max ?? devEntry.Temperature ?? 0;
      const tavg = statsEntry.TAvg ?? statsEntry['tstemp-1'] ?? summary.temp_min ?? data.summ?.temp_min ?? summaryEntry.temp_min ?? 0;
      result.temp_chip = [tmax, tavg].filter((v) => v && v !== -273);

      result.pcb = data.mtype?.subtype ?? '-';

      const poolsArr = data.pools?.POOLS || [];
      result.url = poolsArr[0]?.URL || poolsArr[0]?.url || '-';
      result.user = poolsArr[0]?.User || poolsArr[0]?.user || '-';
      result.alive = poolsArr[0]?.Status || poolsArr[0]?.status || '-';

      for (let i = 1; i <= 2; i++) {
        result[`url${i}`] = poolsArr[i]?.URL || poolsArr[i]?.url || '-';
        result[`user${i}`] = poolsArr[i]?.User || poolsArr[i]?.user || '-';
        result[`alive${i}`] = poolsArr[i]?.Status || poolsArr[i]?.status || '-';
      }

      result.status = data.st;
      const elapsedSrc = statsEntry.Elapsed ?? summaryEntry.Elapsed ?? devEntry['Device Elapsed'] ?? devEntry.Elapsed ?? summary.uptime ?? data.summ?.uptime ?? 0;
      result.elapsed = formatElapsedTime(elapsedSrc * (elapsedSrc > 10000000 ? 1 : 1000));

      result.accepted = (summaryEntry.Accepted ?? devEntry.Accepted ?? summary.accepted ?? data.summ?.accepted ?? 0).toString();
      result.rejected = (summaryEntry.Rejected ?? devEntry.Rejected ?? summary.rejected ?? data.summ?.rejected ?? 0).toString();

      result.workMode = summary.work_mode?.toString() ?? data.summ?.work_mode?.toString() ?? summaryEntry.work_mode?.toString() ?? '-';
      result.chainSN = summary.machine_sn ?? data.summ?.machine_sn ?? summaryEntry.machine_sn ?? '-';

      result.serialNumber = data.mtype?.sn || summary.machine_sn || data.summ?.machine_sn || summaryEntry.machine_sn || '-';
      result.firmware = data.mtype?.snfw || summary.version || data.summ?.version || summaryEntry.version || '-';
      result.bVersion = data.mtype?.bVersion || '-';

      break;
    }

    case 'Whatsminer': {
      let summary = data.summ?.SUMMARY?.[0] || data.summ?.Msg || {};
      if (!data.summ?.SUMMARY && typeof data.summ.STATUS?.Msg === 'object') {
        summary = data.summ.STATUS.Msg;
      }

      result.type = data.stats?.STATUS?.Description || data.devsd?.DEVDETAILS?.[0]?.Model || data.devs?.DEVS?.[0]?.Model || '-';
      result.brand = data.dtype?.split(' ')[0];

      const chainsLength = data.devs.DEVS;
      result.chainSN = chainsLength
        .map((chain) => chain['PCB SN']?.toString() || '0')
        .join(' \n');

      result.rate_5s = summary['MHS 5s']?.toString() ?? summary['GHS 5s']?.toString() ?? '0';
      result.rate_30m = summary['MHS 15m']?.toString() ?? summary['GHS 30m']?.toString() ?? '0';
      result.rate_avg = summary['MHS av']?.toString() ?? summary['GHS av']?.toString() ?? '0';
      result.rateUnit = 'GH/s';

      result.fan = [
        summary['Fan Speed In'],
        summary['Fan Speed Out']
      ].filter((v) => v != null).join(', ');

      result.temp_chip = [
        summary['Chip Temp Min'],
        summary['Chip Temp Avg'],
        summary['Chip Temp Max']
      ].filter((v) => v != null);

      const poolsArr = data.pools?.POOLS || [];
      result.url = poolsArr[0]?.URL ?? '-';
      result.user = poolsArr[0]?.User ?? '-';
      result.alive = poolsArr[0]?.Status ?? '-';
      result.url1 = poolsArr[1]?.URL ?? '-';
      result.user1 = poolsArr[1]?.User ?? '-';
      result.alive1 = poolsArr[1]?.Status ?? '-';
      result.url2 = poolsArr[2]?.URL ?? '-';
      result.user2 = poolsArr[2]?.User ?? '-';
      result.alive2 = poolsArr[2]?.Status ?? '-';

      result.status = data.st;
      result.elapsed = summary.Elapsed != null
        ? formatElapsedTime(summary.Elapsed * 1000)
        : '-';

      const acc0 = Number(poolsArr[0]?.Accepted ?? 0);
      const rej0 = Number(poolsArr[0]?.Rejected ?? 0);
      const acc1 = Number(poolsArr[1]?.Accepted ?? 0);
      const rej1 = Number(poolsArr[1]?.Rejected ?? 0);
      const acc2 = Number(poolsArr[2]?.Accepted ?? 0);
      const rej2 = Number(poolsArr[2]?.Rejected ?? 0);

      result.accepted = (acc0 + acc1 + acc2).toString();
      result.rejected = (rej0 + rej1 + rej2).toString();

      result.serialNumber = '-';
      result.firmware = '-';
      result.bVersion = data.mtype?.bVersion || '-';

      break;
    }

    case 'ICERIVER': {
      result.brand = data.dtype;
      result.type = data.stats?.data?.softver1 || data.stats?.data?.softver2;
      result.rate_5s = data.stats?.data?.rtpow;
      result.rate_avg = data.stats?.data?.avgpow;
      result.rateUnit = data.stats?.data?.unit || 'G';

      const fancount = data.stats?.data?.fancount || 4;
      const fans = data.stats?.data?.fans || [];
      result.fan = fans.slice(0, fancount).filter((v) => v != null).join(', ');

      result.temp_chip = [
        data.stats?.data?.boards?.[0]?.intmp,
        data.stats?.data?.boards?.[0]?.outtmp
      ];

      result.compileTime = data.stats?.data?.refTime;
      result.elapsed = data.stats?.data?.runtime;

      result.url = data.stats?.data?.pools[0]?.addr ?? '-';
      result.user = data.stats?.data?.pools[0]?.user ?? '-';
      result.alive = data.stats?.data?.pools[0]?.connect?.toString() ?? '-';
      result.url1 = data.stats?.data?.pools[1]?.addr ?? '-';
      result.user1 = data.stats?.data?.pools[1]?.user ?? '-';
      result.alive1 = data.stats?.data?.pools[1]?.connect?.toString() ?? '-';
      result.url2 = data.stats?.data?.pools[2]?.addr ?? '-';
      result.user2 = data.stats?.data?.pools[2]?.user ?? '-';
      result.alive2 = data.stats?.data?.pools[2]?.connect?.toString() ?? '-';

      result.freqLevel = data.stats?.data?.boards?.[0]?.freq;
      result.status = data.st;

      const iceriverPools = data.stats?.data?.pools || [];
      const iceriverTotalAccepted = iceriverPools.reduce((sum, p) => sum + (p.accepted || 0), 0);
      const iceriverTotalRejected = iceriverPools.reduce((sum, p) => sum + (p.rejected || 0), 0);
      result.accepted = iceriverTotalAccepted.toString();
      result.rejected = iceriverTotalRejected.toString();

      result.serialNumber = '-';
      result.firmware = '-';
      result.bVersion = data.mtype?.bVersion || '-';

      break;
    }

    case 'BOMBAX': {
      result.brand = data.dtype;
      result.rate_5s = data.stats?.data?.hashrate_rt;
      result.rate_avg = data.stats?.data?.hashrate_avg;
      result.rateUnit = 'MH/s';

      result.workMode = data.stats?.data?.work_mode?.toString() ?? '-';

      result.fan = [
        data.stats?.data?.fan_speed1,
        data.stats?.data?.fan_speed2,
        data.stats?.data?.fan_speed3,
        data.stats?.data?.fan_speed4,
      ].filter((v) => v != null).join(', ');
      result.temp_chip = [data.stats?.data?.temp1];

      result.url = data.stats?.data?.pool1;
      result.user = data.stats?.data?.worker1;
      result.alive = data.stats?.data?.status1;
      result.url1 = data.stats?.data?.pool2;
      result.user1 = data.stats?.data?.worker2;
      result.alive1 = data.stats?.data?.status2;
      result.url2 = data.stats?.data?.pool3;
      result.user2 = data.stats?.data?.worker3;
      result.alive2 = data.stats?.data?.status3;

      result.status = data.st;
      result.elapsed = data.stats?.data?.uptime;
      result.accepted = data.stats?.data?.accept?.toString() || data.stats?.data?.c2_accept?.toString() || '0';
      result.rejected = data.stats?.data?.reject?.toString() || data.stats?.data?.c2_reject?.toString() || '0';
      result.freqLevel = data.stats?.data?.power1;

      result.serialNumber = '-';
      result.firmware = '-';
      result.bVersion = data.mtype?.bVersion || '-';

      break;
    }

    case 'JASMINER': {
      result.brand = data.dtype;
      result.type = data.stats?.minertype?.replace(result.brand, '') || '-';

      const summary = data.summ?.summary || data.summ?.SUMMARY?.[0] || {};
      const pools = data.summ?.pools?.pool || [];
      const boards = data.summ?.boards || {};

      result.rate_5s = summary.rt?.toString() || data.summ?.rt?.toString() || '0';
      result.rate_avg = summary.avg?.toString() || data.summ?.avg?.toString() || '0';
      result.rateUnit = 'MH/s';

      result.url = pools[0]?.url ?? data.summ?.pools?.pool[0]?.url ?? '-';
      result.url1 = pools[1]?.url ?? data.summ?.pools?.pool[1]?.url ?? '-';
      result.url2 = pools[2]?.url ?? data.summ?.pools?.pool[2]?.url ?? '-';
      result.user = pools[0]?.user ?? data.summ?.pools?.pool[0]?.user ?? '-';
      result.user1 = pools[1]?.user ?? data.summ?.pools?.pool[1]?.user ?? '-';
      result.user2 = pools[2]?.user ?? data.summ?.pools?.pool[2]?.user ?? '-';
      result.alive = pools[0]?.status ?? data.summ?.pools?.pool[0]?.status ?? '-';
      result.alive1 = pools[1]?.status ?? data.summ?.pools?.pool[1]?.status ?? '-';
      result.alive2 = pools[2]?.status ?? data.summ?.pools?.pool[2]?.status ?? '-';

      result.confUrl1 = data.conf?.pools?.[0]?.url ?? '-';
      result.confUser1 = data.conf?.pools?.[0]?.user ?? '-';
      result.confUrl2 = data.conf?.pools?.[1]?.url ?? '-';
      result.confUser2 = data.conf?.pools?.[1]?.user ?? '-';
      result.confUrl3 = data.conf?.pools?.[2]?.url ?? '-';
      result.confUser3 = data.conf?.pools?.[2]?.user ?? '-';

      result.status = data.st;
      result.elapsed = data.summ?.SUMMARY?.[0]?.elapsed?.toString() ??
        (data.summ?.summary?.uptime ? formatElapsedTime(data.summ.summary.uptime * 1000) : null) ??
        (summary.uptime ? formatElapsedTime(summary.uptime * 1000) : null) ??
        '-';

      const jasminerTotalAccepted = pools.reduce((sum, p) => sum + (p.accept || 0), 0);
      const jasminerTotalRejected = pools.reduce((sum, p) => sum + (p.reject || 0), 0);
      result.accepted = result.pools?.reduce((sum, p) => sum + p.accepted, 0).toString() ?? jasminerTotalAccepted.toString();
      result.rejected = result.pools?.reduce((sum, p) => sum + p.rejected, 0).toString() ?? jasminerTotalRejected.toString();

      result.workMode = data.summ?.summary?.work_mode?.toString() ?? summary.work_mode?.toString() ?? '-';
      result.chainSN = summary.machine_sn ?? data.summ?.machine_sn ?? '-';

      const fanSpeeds = [
        boards.fan1,
        boards.fan2,
        boards.fan3,
        boards.fan4
      ].filter((v) => v != null);

      if (fanSpeeds.length > 0) {
        result.fan = fanSpeeds.join(', ');
      } else {
        result.fan = '-';
      }

      if (boards.board && Array.isArray(boards.board)) {
        const board = boards.board[0];
        if (board) {
          result.temp_chip = [
            board.asic0_temp,
            board.asic1_temp,
            board.asic2_temp
          ].filter((v) => v != null);
        }
      } else {
        const tempMax = summary.temp_max ?? data.summ?.temp_max;
        const tempMin = summary.temp_min ?? data.summ?.temp_min;
        if (tempMax || tempMin) {
          result.temp_chip = [tempMax, tempMin].filter((v) => v != null);
        }
      }

      result.serialNumber = summary.machine_sn || data.summ?.machine_sn || '-';
      result.firmware = data.stats?.fs_version || data.summ?.version || '-';
      result.bVersion = data.mtype?.bVersion || '-';

      break;
    }

    default:
      console.warn('Unknown dtype:', dtype);
      result.type = 'Unknown Device';
      break;
  }

  return result;
};

