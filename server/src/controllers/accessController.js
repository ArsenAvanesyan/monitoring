const RedisService = require('../services/redisService');
const { REDIS_KEYS, MAX_HISTORY_SIZE } = require('../consts/redis-keys');
const bufferToHex = require('../utils/bufferToHex');
const formatHex = require('../utils/formatHex');
const parseNDJSON = require('../utils/parseNDJSON');

exports.receiveData = async (req, res) => {
  try {
    //? Получаем счетчик из Redis
    const receiveDataCount = await RedisService.increment(
      REDIS_KEYS.COUNTER_RECEIVE
    );
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

    console.log('🔍 Анализ тела запроса:');
    console.log('  req.rawBuffer существует:', !!req.rawBuffer);
    console.log('  req.body тип:', typeof req.body);
    console.log('  req.body является Buffer:', Buffer.isBuffer(req.body));

    if (req.rawBuffer && Buffer.isBuffer(req.rawBuffer)) {
      rawBuffer = req.rawBuffer;
      rawText = req.rawBuffer.toString('utf8');
      console.log(
        '  ✅ Используем req.rawBuffer, размер:',
        rawBuffer.length,
        'байт'
      );
    } else if (req.body && Buffer.isBuffer(req.body)) {
      rawBuffer = req.body;
      rawText = req.body.toString('utf8');
      console.log(
        '  ✅ Используем req.body (Buffer), размер:',
        rawBuffer.length,
        'байт'
      );
    } else if (typeof req.body === 'string') {
      rawText = req.body;
      rawBuffer = Buffer.from(req.body, 'utf8');
      console.log(
        '  ✅ Используем req.body (string), размер:',
        rawBuffer.length,
        'байт'
      );
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
    console.log(
      '  IP:',
      req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress
    );
    console.log('  От Dashboard:', isFromDashboard);
    console.log('  От access.exe:', isFromAccessExe);

    //? Парсим данные как NDJSON (newline-delimited JSON)
    let parsedData = [];
    if (rawText) {
      console.log(
        'Raw текст (первые 500 символов):',
        rawText.substring(0, 500)
      );

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
            parsedData = [
              { raw: rawText.substring(0, 1000), error: 'Parse error' },
            ];
          }
        }
      }
    } else if (
      req.body &&
      typeof req.body === 'object' &&
      !Array.isArray(req.body)
    ) {
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

    //? Если это данные от access.exe, очищаем старые тестовые данные из Redis
    if (isFromAccessExe) {
      console.log(
        '🎯 Получены данные от access.exe - очищаем старые тестовые данные'
      );
      try {
        const existingData = await RedisService.getList(REDIS_KEYS.DATA_ARRAY);
        const filteredData = existingData.filter((d) => d.test !== true);
        // Очищаем список и добавляем только реальные данные
        await RedisService.clearList(REDIS_KEYS.DATA_ARRAY);
        for (const item of filteredData) {
          await RedisService.pushToList(
            REDIS_KEYS.DATA_ARRAY,
            item,
            MAX_HISTORY_SIZE
          );
        }
      } catch (error) {
        console.error('Ошибка при очистке тестовых данных из Redis:', error);
      }
    }

    //? Сохраняем данные в Redis
    //? Если один объект - сохраняем как объект, если несколько - как массив
    const lastData = parsedData.length === 1 ? parsedData[0] : parsedData;
    await RedisService.set(REDIS_KEYS.LAST_DATA, lastData);

    //? Добавляем все объекты в список Redis (для истории)
    for (const item of parsedData) {
      await RedisService.pushToList(
        REDIS_KEYS.DATA_ARRAY,
        item,
        MAX_HISTORY_SIZE
      );
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
    const dataArrayLength = await RedisService.getListLength(
      REDIS_KEYS.DATA_ARRAY
    );
    console.log('✅ Данные сохранены в Redis:');
    console.log(`Всего объектов в истории: ${dataArrayLength}`);
    console.log('lastAccessTimestamp:', timestamp);

    //? Отправляем успешный ответ
    res.status(200).json({
      message: 'Данные успешно получены',
      received: true,
      count: parsedData.length,
      data: lastAccessData,
      allData: parsedData,
      hexData: hexData ? formatHex(hexData) : null,
      timestamp: lastAccessTimestamp,
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

//? Получение последних данных от access.exe
exports.getLastData = async (req, res) => {
  try {
    //? Инкрементируем счетчик запросов
    const getLastDataCount = await RedisService.increment(
      REDIS_KEYS.COUNTER_GET
    );

    //? И Получаем данные из Redis
    const lastAccessData = await RedisService.get(REDIS_KEYS.LAST_DATA);
    const lastAccessDataArray = await RedisService.getList(
      REDIS_KEYS.DATA_ARRAY
    );
    const lastAccessTimestamp = await RedisService.get(REDIS_KEYS.TIMESTAMP);
    const lastHexData = await RedisService.get(REDIS_KEYS.HEX_DATA);

    //? Логируем запрос для отладки
    console.log('='.repeat(50));
    console.log(`📥 GET /api/access/last запрос #${getLastDataCount}:`);
    console.log(
      'lastAccessData:',
      lastAccessData ? 'ЕСТЬ ДАННЫЕ' : 'НЕТ ДАННЫХ'
    );
    console.log('Всего объектов в истории:', lastAccessDataArray.length);

    //? Фильтруем тестовые данные из ответа, если есть реальные данные
    const realDataArray = lastAccessDataArray.filter((d) => d.test !== true);
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
