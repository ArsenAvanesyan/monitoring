const RedisService = require('../services/redisService');
const MinerService = require('../services/minerService');
const { REDIS_KEYS, MAX_HISTORY_SIZE } = require('../consts/redis-keys');
const bufferToHex = require('../utils/bufferToHex');
const formatHex = require('../utils/formatHex');
const parseNDJSON = require('../utils/parseNDJSON');
const { processGzipArchive } = require('../utils/gzipUtils');
const websocketService = require('../services/websocketService');

//? Функция для нормализации IP адреса (приводит к строке и убирает пробелы)
const normalizeIp = (ip) => {
  if (!ip) return null;
  // Преобразуем в строку и убираем пробелы
  const ipStr = String(ip).trim();
  return ipStr || null;
};

//? Функция для получения IP из устройства (проверяет разные поля)
const getDeviceIp = (device) => {
  return normalizeIp(device.ip) || normalizeIp(device.ipAddress) || normalizeIp(device.IP) || null;
};

//? Функция для удаления дубликатов устройств по IP
const removeDuplicateDevices = (devices) => {
  const deviceMap = new Map();
  const duplicatesRemoved = [];

  // Проходим по устройствам в обратном порядке, чтобы оставить последнее вхождение
  for (let i = devices.length - 1; i >= 0; i--) {
    const device = devices[i];
    const deviceIp = getDeviceIp(device);

    if (deviceIp) {
      if (!deviceMap.has(deviceIp)) {
        deviceMap.set(deviceIp, device);
      } else {
        duplicatesRemoved.push(deviceIp);
      }
    } else {
      // Устройства без IP оставляем (но они не должны дублироваться)
      deviceMap.set(`no-ip-${i}`, device);
    }
  }

  if (duplicatesRemoved.length > 0) {
    const uniqueDuplicates = [...new Set(duplicatesRemoved)];
    console.log(
      `🧹 Удалено ${duplicatesRemoved.length} дубликатов устройств по IP (${uniqueDuplicates.length} уникальных IP):`,
      uniqueDuplicates
    );
  }

  const result = Array.from(deviceMap.values());
  console.log(`📊 Результат удаления дубликатов: было ${devices.length}, стало ${result.length}`);

  // Возвращаем массив уникальных устройств
  return result;
};

exports.receiveData = async (req, res) => {
  try {
    //? Получаем счетчик из Redis
    const receiveDataCount = await RedisService.increment(REDIS_KEYS.COUNTER_RECEIVE);
    //? Логируем все детали запроса для отладки
    console.log('='.repeat(50));
    console.log(`🔥 POST запрос #${receiveDataCount} от access.exe:`);
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('URL:', req.url);
    console.log('Original URL:', req.originalUrl);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);

    //? Получаем raw body как Buffer или строку
    let rawText = null;
    let rawBuffer = null;
    const isGzip = req.isGzip || req.headers['content-type'] === 'application/gzip';
    const filename = req.filename || req.headers['x-filename'] || null;

    console.log('🔍 Анализ тела запроса:');
    console.log('  req.rawBuffer существует:', !!req.rawBuffer);
    console.log('  req.body тип:', typeof req.body);
    console.log('  req.body является Buffer:', Buffer.isBuffer(req.body));
    console.log('  Это gzip архив:', isGzip ? 'ДА' : 'НЕТ');
    if (filename) {
      console.log('  Имя файла:', filename);
    }

    //? Если это gzip архив - распаковываем
    if (isGzip) {
      try {
        const gzipBuffer = req.rawBuffer || (req.body && Buffer.isBuffer(req.body) ? req.body : null);

        if (!gzipBuffer) {
          throw new Error('Не удалось получить gzip данные из запроса');
        }

        console.log('📦 Обнаружен gzip архив, начинаем распаковку...');
        rawText = await processGzipArchive(gzipBuffer, filename);
        rawBuffer = Buffer.from(rawText, 'utf8');
        console.log('  ✅ Gzip архив распакован и обработан');
      } catch (error) {
        console.error('❌ Ошибка обработки gzip архива:', error);
        return res.status(400).json({
          error: 'Ошибка обработки gzip архива',
          message: error.message,
        });
      }
    } else {
      //? Обычная обработка (не gzip)
      if (req.rawBuffer && Buffer.isBuffer(req.rawBuffer)) {
        rawBuffer = req.rawBuffer;
        rawText = req.rawBuffer.toString('utf8');
        console.log('  ✅ Используем req.rawBuffer, размер:', rawBuffer.length, 'байт');
      } else if (req.body && Buffer.isBuffer(req.body)) {
        rawBuffer = req.body;
        rawText = req.body.toString('utf8');
        console.log('  ✅ Используем req.body (Buffer), размер:', rawBuffer.length, 'байт');
      } else if (typeof req.body === 'string') {
        rawText = req.body;
        rawBuffer = Buffer.from(req.body, 'utf8');
        console.log('  ✅ Используем req.body (string), размер:', rawBuffer.length, 'байт');
      } else if (req.body && typeof req.body === 'object') {
        //? Если это уже объект, преобразуем в строку для обработки
        rawText = JSON.stringify(req.body);
        rawBuffer = Buffer.from(rawText, 'utf8');
        console.log(
          '  ✅ Используем req.body (object), преобразован в строку, размер:',
          rawBuffer.length,
          'байт'
        );
      } else {
        console.log('  ⚠️ Тело запроса пусто или неизвестного типа');
      }
    }

    //? Преобразуем в hex, если есть бинарные данные
    let hexData = null;
    if (rawBuffer) {
      hexData = bufferToHex(rawBuffer);
      console.log('Размер данных:', rawBuffer.length, 'байт');
    }

    //? Определяем источник данных
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const origin = req.headers['origin'] || '';
    const isFromDashboard =
      referer.includes('/dashboard') ||
      userAgent.includes('Mozilla') ||
      origin.includes('mon.incoel.ru');
    const isFromAccessExe = !isFromDashboard;

    console.log('📡 Источник запроса:');
    console.log('  User-Agent:', userAgent || '(пусто)');
    console.log('  Referer:', referer || '(пусто)');
    console.log('  Origin:', origin || '(пусто)');
    console.log('  IP:', req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress);
    console.log('  От Dashboard:', isFromDashboard);
    console.log('  От access.exe:', isFromAccessExe);

    //? Парсим данные как NDJSON (newline-delimited JSON)
    let parsedData = [];
    if (rawText) {
      console.log('Raw текст (первые 500 символов):', rawText.substring(0, 500));

      //? Пытаемся распарсить как NDJSON (каждая строка - отдельный JSON)
      parsedData = parseNDJSON(rawText);

      if (parsedData.length === 0) {
        //? Если не получилось как NDJSON, пробуем как один JSON объект
        try {
          const singleObj = JSON.parse(rawText.trim());
          parsedData = [singleObj];
        } catch (e) {
          //? Если и это не сработало, пробуем как массив JSON объектов
          try {
            const arrayText =
              '[' +
              rawText
                .split('\n')
                .filter((l) => l.trim())
                .join(',') +
              ']';
            parsedData = JSON.parse(arrayText);
          } catch (e2) {
            console.error('Не удалось распарсить данные:', e2.message);
            //? Сохраняем как есть
            parsedData = [{ raw: rawText.substring(0, 1000), error: 'Parse error' }];
          }
        }
      }
    } else if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      //? Если body уже объект (не массив), оборачиваем в массив
      parsedData = [req.body];
    } else if (Array.isArray(req.body)) {
      parsedData = req.body;
    }

    console.log(`✅ Распарсено объектов: ${parsedData.length}`);
    if (parsedData.length > 0) {
      console.log('📦 Первый объект (первые 500 символов):');
      console.log(JSON.stringify(parsedData[0], null, 2).substring(0, 500));
      if (parsedData.length > 1) {
        console.log(`... и еще ${parsedData.length - 1} объектов`);
      }
    }
    console.log('='.repeat(50));

    //? Сохраняем данные в БД, если есть пользователь (данные от access.exe)
    const user = res.locals.user;
    console.log('🔍 Проверка условий для сохранения в БД:');
    console.log('  user:', user ? `ID=${user.id}, login=${user.login || user.email}` : 'НЕТ');
    console.log('  user.id:', user?.id || 'НЕТ');
    console.log('  isFromAccessExe:', isFromAccessExe);
    console.log('  parsedData.length:', parsedData.length);

    if (user && user.id && isFromAccessExe && parsedData.length > 0) {
      console.log('💾 Сохранение данных майнеров в БД для пользователя:', user.id);
      try {
        let savedCount = 0;
        let errorCount = 0;

        for (const minerData of parsedData) {
          try {
            await MinerService.saveMinerData(user.id, minerData);
            savedCount++;
          } catch (error) {
            console.error('❌ Ошибка при сохранении данных майнера:', error.message);
            console.error('  Stack:', error.stack);
            errorCount++;
          }
        }

        console.log(`✅ Сохранено в БД: ${savedCount} майнеров, ошибок: ${errorCount}`);

        // Выполняем очистку старых данных на основе настройки пользователя
        try {
          const retentionPeriod = user.historyRetentionPeriod || 'half-year';
          await MinerService.cleanupOldMinerData(user.id, retentionPeriod);
        } catch (cleanupError) {
          console.warn('⚠️ Ошибка при очистке старых данных:', cleanupError.message);
        }
      } catch (dbError) {
        console.error('❌ Ошибка при сохранении данных в БД:', dbError);
        console.error('  Stack:', dbError.stack);
        // Продолжаем выполнение, не прерываем обработку запроса
      }
    } else {
      console.log('⚠️ Данные НЕ будут сохранены в БД:');
      if (!user) console.log('  - Пользователь не найден в res.locals.user');
      if (!user?.id) console.log('  - У пользователя нет ID');
      if (!isFromAccessExe) console.log('  - Запрос не от access.exe (isFromAccessExe=false)');
      if (parsedData.length === 0) console.log('  - Нет данных для сохранения (parsedData пуст)');
    }

    //? Если это данные от access.exe, обновляем устройства по IP вместо дублирования
    if (isFromAccessExe) {
      console.log('🎯 Получены данные от access.exe - обновляем устройства по IP');
      try {
        // Получаем существующие данные из Redis
        const existingData = await RedisService.getList(REDIS_KEYS.DATA_ARRAY);

        // Разделяем на тестовые и реальные данные
        const testData = existingData.filter((d) => d.test === true);
        const realData = existingData.filter((d) => d.test !== true);

        // Создаем Map для быстрого поиска устройств по IP
        const deviceMap = new Map();

        // Сначала удаляем дубликаты из существующих данных
        const uniqueRealData = removeDuplicateDevices(realData);
        console.log(
          `📋 Было устройств: ${realData.length}, стало уникальных: ${uniqueRealData.length}`
        );

        // Добавляем существующие реальные устройства в Map (ключ - IP)
        for (const device of uniqueRealData) {
          const deviceIp = getDeviceIp(device);
          if (deviceIp) {
            deviceMap.set(deviceIp, device);
          }
        }

        // Обновляем или добавляем новые устройства
        let updatedCount = 0;
        let addedCount = 0;

        for (const newDevice of parsedData) {
          const deviceIp = getDeviceIp(newDevice);
          if (deviceIp) {
            if (deviceMap.has(deviceIp)) {
              // Обновляем существующее устройство
              deviceMap.set(deviceIp, newDevice);
              updatedCount++;
              console.log(`  ✅ Обновлено устройство с IP: ${deviceIp}`);
            } else {
              // Добавляем новое устройство
              deviceMap.set(deviceIp, newDevice);
              addedCount++;
              console.log(`  ➕ Добавлено новое устройство с IP: ${deviceIp}`);
            }
          } else {
            console.log(`  ⚠️ Пропущено устройство без IP:`, newDevice);
          }
        }

        console.log(`📊 Статистика обновления: обновлено ${updatedCount}, добавлено ${addedCount}`);

        // Преобразуем Map обратно в массив и еще раз проверяем на дубликаты
        const updatedRealData = removeDuplicateDevices(Array.from(deviceMap.values()));
        console.log(`📊 Финальное количество уникальных устройств: ${updatedRealData.length}`);

        // Очищаем список и добавляем обновленные данные
        await RedisService.clearList(REDIS_KEYS.DATA_ARRAY);

        // Сначала добавляем реальные данные
        for (const item of updatedRealData) {
          await RedisService.pushToList(REDIS_KEYS.DATA_ARRAY, item, MAX_HISTORY_SIZE);
        }

        // Затем добавляем тестовые данные (если они есть)
        for (const item of testData) {
          await RedisService.pushToList(REDIS_KEYS.DATA_ARRAY, item, MAX_HISTORY_SIZE);
        }
      } catch (error) {
        console.error('Ошибка при обновлении устройств по IP:', error);
        // В случае ошибки продолжаем со старой логикой
        console.log('⚠️ Используем старую логику добавления данных');
      }
    }

    //? Сохраняем данные в Redis
    //? Если один объект - сохраняем как объект, если несколько - как массив
    const lastData = parsedData.length === 1 ? parsedData[0] : parsedData;
    await RedisService.set(REDIS_KEYS.LAST_DATA, lastData);

    //? Добавляем все объекты в список Redis (для истории) только если это НЕ данные от access.exe
    //? (для access.exe мы уже обработали выше)
    if (!isFromAccessExe) {
      for (const item of parsedData) {
        await RedisService.pushToList(REDIS_KEYS.DATA_ARRAY, item, MAX_HISTORY_SIZE);
      }
    }

    //? Сохраняем hex данные и временную метку
    const formattedHexData = hexData ? formatHex(hexData) : null;
    const timestamp = new Date().toISOString();

    if (formattedHexData) {
      await RedisService.set(REDIS_KEYS.HEX_DATA, formattedHexData);
    }
    await RedisService.set(REDIS_KEYS.TIMESTAMP, timestamp);

    //? Инкрементируем счетчик получения данных
    await RedisService.increment(REDIS_KEYS.COUNTER_RECEIVE);

    //? Логируем сохранение данных
    const dataArrayLength = await RedisService.getListLength(REDIS_KEYS.DATA_ARRAY);
    console.log('✅ Данные сохранены в Redis:');
    console.log(`Всего объектов в истории: ${dataArrayLength}`);
    console.log('lastAccessTimestamp:', timestamp);

    //? Получаем финальные данные для отправки клиентам
    const finalDataArray = await RedisService.getList(REDIS_KEYS.DATA_ARRAY);
    const realDataArray = finalDataArray.filter((d) => d.test !== true);
    // Удаляем дубликаты из реальных данных
    const uniqueRealDataArray = removeDuplicateDevices(realDataArray);
    const hasRealData = uniqueRealDataArray.length > 0;
    const dataToSend = hasRealData ? uniqueRealDataArray : finalDataArray;

    //? Отправляем событие всем подключенным WebSocket клиентам
    websocketService.broadcast('data-received', {
      success: true,
      message: 'Данные успешно получены и сохранены',
      count: parsedData.length,
      totalDevices: dataToSend.length,
      timestamp: timestamp,
      hasRealData: hasRealData,
    });

    //? Отправляем успешный ответ
    res.status(200).json({
      message: 'Данные успешно получены',
      received: true,
      count: parsedData.length,
      data: lastData,
      allData: parsedData,
      hexData: hexData ? formatHex(hexData) : null,
      timestamp: timestamp,
    });
  } catch (error) {
    console.error('Ошибка при получении данных от access.exe:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Ошибка обработки данных',
      message: error.message,
    });
  }
};

//? Очистка данных (для удаления тестовых данных)
exports.clearData = async (req, res) => {
  try {
    console.log('🧹 Очистка данных от access.exe из Redis');

    //? Удаляем все ключи, связанные с данными access.exe
    await RedisService.delete(REDIS_KEYS.LAST_DATA);
    await RedisService.clearList(REDIS_KEYS.DATA_ARRAY);
    await RedisService.delete(REDIS_KEYS.TIMESTAMP);
    await RedisService.delete(REDIS_KEYS.HEX_DATA);
    await RedisService.delete(REDIS_KEYS.COUNTER_RECEIVE);
    await RedisService.delete(REDIS_KEYS.COUNTER_GET);

    console.log('✅ Все данные очищены из Redis');

    //? Отправляем событие всем подключенным WebSocket клиентам
    websocketService.broadcast('data-cleared', {
      success: true,
      message: 'Данные успешно очищены',
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      message: 'Данные успешно очищены',
      cleared: true,
    });
  } catch (error) {
    console.error('Ошибка при очистке данных:', error);
    res.status(500).json({
      error: 'Ошибка очистки данных',
      message: error.message,
    });
  }
};

//? Очистка дубликатов устройств по IP
exports.removeDuplicates = async (req, res) => {
  try {
    console.log('🧹 Очистка дубликатов устройств по IP из Redis');

    // Получаем все данные из Redis
    const existingData = await RedisService.getList(REDIS_KEYS.DATA_ARRAY);
    console.log(`📋 Всего устройств до очистки: ${existingData.length}`);

    // Разделяем на тестовые и реальные данные
    const testData = existingData.filter((d) => d.test === true);
    const realData = existingData.filter((d) => d.test !== true);

    // Удаляем дубликаты из реальных данных
    const uniqueRealData = removeDuplicateDevices(realData);
    console.log(`📊 Уникальных устройств после очистки: ${uniqueRealData.length}`);
    console.log(`🗑️ Удалено дубликатов: ${realData.length - uniqueRealData.length}`);

    // Очищаем список и добавляем уникальные данные
    await RedisService.clearList(REDIS_KEYS.DATA_ARRAY);

    // Сначала добавляем реальные данные
    for (const item of uniqueRealData) {
      await RedisService.pushToList(REDIS_KEYS.DATA_ARRAY, item, MAX_HISTORY_SIZE);
    }

    // Затем добавляем тестовые данные (если они есть)
    for (const item of testData) {
      await RedisService.pushToList(REDIS_KEYS.DATA_ARRAY, item, MAX_HISTORY_SIZE);
    }

    // Обновляем LAST_DATA, если это массив устройств
    const lastData = await RedisService.get(REDIS_KEYS.LAST_DATA);
    if (Array.isArray(lastData)) {
      const uniqueLastData = removeDuplicateDevices(lastData);
      await RedisService.set(
        REDIS_KEYS.LAST_DATA,
        uniqueLastData.length === 1 ? uniqueLastData[0] : uniqueLastData
      );
    }

    console.log('✅ Дубликаты успешно удалены из Redis');

    res.status(200).json({
      message: 'Дубликаты успешно удалены',
      removed: realData.length - uniqueRealData.length,
      before: existingData.length,
      after: uniqueRealData.length + testData.length,
      duplicatesRemoved: true,
    });
  } catch (error) {
    console.error('Ошибка при удалении дубликатов:', error);
    res.status(500).json({
      error: 'Ошибка удаления дубликатов',
      message: error.message,
    });
  }
};

//? Получение последних данных от access.exe
exports.getLastData = async (req, res) => {
  try {
    //? Инкрементируем счетчик запросов
    const getLastDataCount = await RedisService.increment(REDIS_KEYS.COUNTER_GET);

    //? Логируем запрос для отладки
    console.log('='.repeat(50));
    console.log(`📥 GET /api/access/last запрос #${getLastDataCount}:`);

    //? Пытаемся получить пользователя из res.locals (если есть авторизация)
    const user = res.locals.user;

    //? Если есть авторизованный пользователь, получаем данные из БД
    if (user && user.id) {
      console.log('🔍 Получение данных из БД для пользователя:', user.id);
      try {
        const dbData = await MinerService.getLatestMinersData(user.id);
        const timestamp = new Date().toISOString();

        console.log(`✅ Получено из БД: ${dbData.length} майнеров`);

        if (dbData.length === 0) {
          // Если в БД нет данных, пробуем получить из Redis
          console.log('⚠️ В БД нет данных, пробуем получить из Redis');
        } else {
          const lastDataToReturn = dbData.length === 1 ? dbData[0] : dbData;
          return res.status(200).json({
            message: 'Последние данные от access.exe (из БД)',
            data: lastDataToReturn,
            allData: dbData,
            count: dbData.length,
            hexData: null,
            timestamp: timestamp,
            hasRealData: true,
            hasTestData: false,
            totalCount: dbData.length,
            source: 'database',
          });
        }
      } catch (dbError) {
        console.error('❌ Ошибка при получении данных из БД:', dbError);
        console.log('⚠️ Продолжаем с получением из Redis');
      }
    }

    //? Получаем данные из Redis (обратная совместимость или если нет авторизации)
    const lastAccessData = await RedisService.get(REDIS_KEYS.LAST_DATA);
    const lastAccessDataArray = await RedisService.getList(REDIS_KEYS.DATA_ARRAY);
    const lastAccessTimestamp = await RedisService.get(REDIS_KEYS.TIMESTAMP);
    const lastHexData = await RedisService.get(REDIS_KEYS.HEX_DATA);

    console.log('lastAccessData:', lastAccessData ? 'ЕСТЬ ДАННЫЕ' : 'НЕТ ДАННЫХ');
    console.log('Всего объектов в истории:', lastAccessDataArray.length);

    //? Фильтруем тестовые данные из ответа, если есть реальные данные
    let realDataArray = lastAccessDataArray.filter((d) => d.test !== true);

    //? Удаляем дубликаты из реальных данных перед возвратом
    realDataArray = removeDuplicateDevices(realDataArray);

    const hasRealData = realDataArray.length > 0;
    const hasTestData = lastAccessDataArray.some((d) => d.test === true);

    console.log('Реальных данных:', realDataArray.length);
    console.log('Тестовых данных:', hasTestData ? 'ЕСТЬ' : 'НЕТ');
    console.log('lastAccessTimestamp:', lastAccessTimestamp);
    console.log('='.repeat(50));

    if (!lastAccessData && lastAccessDataArray.length === 0) {
      return res.status(200).json({
        message: 'Данные еще не получены',
        data: null,
        allData: [],
        hexData: null,
        timestamp: null,
        hasRealData: false,
        hasTestData: false,
        source: 'redis',
      });
    }

    //? Возвращаем реальные данные, если они есть, иначе все данные
    const dataToReturn = hasRealData ? realDataArray : lastAccessDataArray;
    const lastDataToReturn =
      hasRealData && realDataArray.length > 0
        ? realDataArray.length === 1
          ? realDataArray[0]
          : realDataArray
        : lastAccessData;

    res.status(200).json({
      message: 'Последние данные от access.exe',
      data: lastDataToReturn, //? Последний объект или массив (без тестовых, если есть реальные)
      allData: dataToReturn, //? Все полученные объекты (без тестовых, если есть реальные)
      count: dataToReturn.length,
      hexData: lastHexData,
      timestamp: lastAccessTimestamp,
      hasRealData: hasRealData,
      hasTestData: hasTestData,
      totalCount: lastAccessDataArray.length, //?    Общее количество (включая тестовые)
      source: 'redis',
    });
  } catch (error) {
    console.error('Ошибка при получении последних данных:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Ошибка получения данных',
      message: error.message,
    });
  }
};
