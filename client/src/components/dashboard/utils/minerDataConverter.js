// Утилита для преобразования данных от access.exe в формат для таблицы устройств

/**
 * Преобразует данные майнера от access.exe в формат устройства для таблицы
 */
export const convertMinerToDevice = (miner, index) => {
    // Получаем статус
    let status = 'offline';
    if (miner.error) {
        if (miner.error === 'Bad server address' || miner.st === 4) {
            status = 'offline';
        } else if (miner.error === 'Timeout') {
            status = 'offline';
        } else {
            status = 'offline';
        }
    } else if (miner.st === '200' || miner.st === 200) {
        status = 'online';
    } else if (miner.st === '401' || miner.st === 401) {
        status = 'degraded';
    } else if (miner.st === '404' || miner.st === 404) {
        status = 'offline';
    } else {
        status = 'offline';
    }

    // Получаем тип майнера
    const minerType = miner.mtype?.miner_type || miner.dtype || 'Неизвестно';
    const model = minerType;
    const name = minerType;

    // Получаем hashrate
    let hashrate = 0;
    let hashrateUnit = 'TH/s';
    if (miner.summ?.SUMMARY?.[0]) {
        const summary = miner.summ.SUMMARY[0];
        if (summary.rate_avg) {
            hashrate = summary.rate_avg;
            hashrateUnit = summary.rate_unit || '/s';

            // Конвертируем единицы измерения
            if (hashrateUnit.includes('GH/s')) {
                hashrate = hashrate / 1000; // GH/s -> TH/s
                hashrateUnit = 'TH/s';
            } else if (hashrateUnit.includes('PH/s')) {
                hashrate = hashrate * 1000; // PH/s -> TH/s
                hashrateUnit = 'TH/s';
            } else if (hashrateUnit.includes('/s') && !hashrateUnit.includes('H')) {
                // Если просто /s, предполагаем что это TH/s
                hashrateUnit = 'TH/s';
            }
        }
    }

    // Получаем температуру
    let temperature = 0;
    if (miner.stats?.STATS?.[0]) {
        const stats = miner.stats.STATS[0];
        if (stats.chain && Array.isArray(stats.chain) && stats.chain.length > 0) {
            // Берем среднюю температуру из всех чипов
            const temps = [];
            stats.chain.forEach(chain => {
                if (chain.temp_chip && Array.isArray(chain.temp_chip)) {
                    temps.push(...chain.temp_chip.filter(t => typeof t === 'number' && !isNaN(t)));
                }
            });
            if (temps.length > 0) {
                temperature = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
            }
        }
        // Альтернативный способ - через temp
        if (temperature === 0 && stats.temp && Array.isArray(stats.temp)) {
            const validTemps = stats.temp.filter(t => typeof t === 'number' && !isNaN(t) && t > 0);
            if (validTemps.length > 0) {
                temperature = Math.round(validTemps.reduce((a, b) => a + b, 0) / validTemps.length);
            }
        }
    }

    // Получаем скорость вентиляторов
    let fanSpeed = 0;
    if (miner.stats?.STATS?.[0]?.fan) {
        const fans = miner.stats.STATS[0].fan;
        if (Array.isArray(fans) && fans.length > 0) {
            const validFans = fans.filter(f => typeof f === 'number' && !isNaN(f) && f > 0);
            if (validFans.length > 0) {
                fanSpeed = Math.round(validFans.reduce((a, b) => a + b, 0) / validFans.length);
            }
        }
    }

    // Получаем пул
    let pool = 'N/A';
    if (miner.pools?.POOLS && Array.isArray(miner.pools.POOLS) && miner.pools.POOLS.length > 0) {
        const firstPool = miner.pools.POOLS.find(p => p.status === 'Alive' || p.status === 'Enabled');
        if (firstPool && firstPool.url) {
            try {
                pool = new URL(firstPool.url).hostname;
            } catch (e) {
                pool = firstPool.url;
            }
        } else if (miner.pools.POOLS[0]?.url) {
            try {
                pool = new URL(miner.pools.POOLS[0].url).hostname;
            } catch (e) {
                pool = miner.pools.POOLS[0].url;
            }
        }
    }

    // Получаем worker
    let worker = 'N/A';
    if (miner.pools?.POOLS?.[0]?.user) {
        worker = miner.pools.POOLS[0].user;
    }

    // Получаем uptime
    let uptime = '0h';
    if (miner.summ?.SUMMARY?.[0]?.elapsed) {
        const seconds = miner.summ.SUMMARY[0].elapsed;
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        if (days > 0) {
            uptime = `${days}d ${hours}h`;
        } else {
            uptime = `${hours}h`;
        }
    }

    return {
        id: miner.ip || `miner-${index}`,
        name: name,
        model: model,
        status: status,
        hashrate: hashrate,
        hashrateUnit: hashrateUnit,
        temperature: temperature,
        fanSpeed: fanSpeed,
        pool: pool,
        worker: worker,
        ipAddress: miner.ip || 'N/A',
        uptime: uptime,
        rawData: miner // Сохраняем исходные данные для детального просмотра
    };
};

/**
 * Преобразует массив данных от access.exe в массив устройств
 */
export const convertMinersToDevices = (minersArray) => {
    if (!Array.isArray(minersArray) || minersArray.length === 0) {
        return [];
    }

    return minersArray
        .filter(miner => miner.ip) // Фильтруем только майнеры с IP
        .map((miner, index) => convertMinerToDevice(miner, index));
};

