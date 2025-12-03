// server/src/controllers/accessController.js

// Хранилище последних данных от access.exe (в памяти)
let lastAccessData = null; // Последний объект или массив объектов
let lastAccessDataArray = []; // Массив всех полученных объектов
let lastAccessTimestamp = null;
let lastHexData = null; // Хранение hex данных
let receiveDataCount = 0;
let getLastDataCount = 0;

// Функция для преобразования бинарных данных в hex
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}

// Функция для форматирования hex в читаемый вид (с переносами строк)
function formatHex(hexString, bytesPerLine = 16) {
    const bytes = hexString.split(' ');
    let result = '';
    for (let i = 0; i < bytes.length; i += bytesPerLine) {
        const line = bytes.slice(i, i + bytesPerLine);
        const offset = i.toString(16).padStart(8, '0');
        const hex = line.join(' ');
        const ascii = line.map(b => {
            const charCode = parseInt(b, 16);
            return (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : '.';
        }).join('');
        result += `${offset}:  ${hex.padEnd(48)}  ${ascii}\n`;
    }
    return result;
}

// Функция для парсинга NDJSON (newline-delimited JSON)
function parseNDJSON(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const parsed = [];

    for (const line of lines) {
        try {
            const obj = JSON.parse(line.trim());
            parsed.push(obj);
        } catch (e) {
            console.warn('Не удалось распарсить строку как JSON:', line.substring(0, 100));
        }
    }

    return parsed;
}

exports.receiveData = async (req, res) => {
    try {
        receiveDataCount++;
        // Логируем все детали запроса для отладки
        console.log('='.repeat(50));
        console.log(`🔥 POST запрос #${receiveDataCount} от access.exe:`);
        console.log('Method:', req.method);
        console.log('Path:', req.path);
        console.log('URL:', req.url);
        console.log('Original URL:', req.originalUrl);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Content-Length:', req.headers['content-length']);

        // Получаем raw body как Buffer или строку
        let rawText = null;
        let rawBuffer = null;

        console.log('🔍 Анализ тела запроса:');
        console.log('  req.rawBuffer существует:', !!req.rawBuffer);
        console.log('  req.body тип:', typeof req.body);
        console.log('  req.body является Buffer:', Buffer.isBuffer(req.body));

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
            // Если это уже объект, преобразуем в строку для обработки
            rawText = JSON.stringify(req.body);
            rawBuffer = Buffer.from(rawText, 'utf8');
            console.log('  ✅ Используем req.body (object), преобразован в строку, размер:', rawBuffer.length, 'байт');
        } else {
            console.log('  ⚠️ Тело запроса пусто или неизвестного типа');
        }

        // Преобразуем в hex, если есть бинарные данные
        let hexData = null;
        if (rawBuffer) {
            hexData = bufferToHex(rawBuffer);
            console.log('Размер данных:', rawBuffer.length, 'байт');
        }

        // Определяем источник данных
        const userAgent = req.headers['user-agent'] || '';
        const referer = req.headers['referer'] || '';
        const origin = req.headers['origin'] || '';
        const isFromDashboard = referer.includes('/dashboard') || userAgent.includes('Mozilla') || origin.includes('mon.incoel.ru');
        const isFromAccessExe = !isFromDashboard;

        console.log('📡 Источник запроса:');
        console.log('  User-Agent:', userAgent || '(пусто)');
        console.log('  Referer:', referer || '(пусто)');
        console.log('  Origin:', origin || '(пусто)');
        console.log('  IP:', req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress);
        console.log('  От Dashboard:', isFromDashboard);
        console.log('  От access.exe:', isFromAccessExe);

        // Парсим данные как NDJSON (newline-delimited JSON)
        let parsedData = [];
        if (rawText) {
            console.log('Raw текст (первые 500 символов):', rawText.substring(0, 500));

            // Пытаемся распарсить как NDJSON (каждая строка - отдельный JSON)
            parsedData = parseNDJSON(rawText);

            if (parsedData.length === 0) {
                // Если не получилось как NDJSON, пробуем как один JSON объект
                try {
                    const singleObj = JSON.parse(rawText.trim());
                    parsedData = [singleObj];
                } catch (e) {
                    // Если и это не сработало, пробуем как массив JSON объектов
                    try {
                        const arrayText = '[' + rawText.split('\n').filter(l => l.trim()).join(',') + ']';
                        parsedData = JSON.parse(arrayText);
                    } catch (e2) {
                        console.error('Не удалось распарсить данные:', e2.message);
                        // Сохраняем как есть
                        parsedData = [{ raw: rawText.substring(0, 1000), error: 'Parse error' }];
                    }
                }
            }
        } else if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            // Если body уже объект (не массив), оборачиваем в массив
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

        // Если это данные от access.exe, очищаем старые тестовые данные
        if (isFromAccessExe) {
            console.log('🎯 Получены данные от access.exe - очищаем старые тестовые данные');
            lastAccessDataArray = lastAccessDataArray.filter(d => d.test !== true);
        }

        // Сохраняем данные
        // Если один объект - сохраняем как объект, если несколько - как массив
        if (parsedData.length === 1) {
            lastAccessData = parsedData[0];
        } else {
            lastAccessData = parsedData; // Массив объектов
        }

        // Добавляем все объекты в общий массив (для истории)
        lastAccessDataArray = [...lastAccessDataArray, ...parsedData];
        // Ограничиваем размер массива (последние 1000 объектов)
        if (lastAccessDataArray.length > 1000) {
            lastAccessDataArray = lastAccessDataArray.slice(-1000);
        }

        lastHexData = hexData ? formatHex(hexData) : null;
        lastAccessTimestamp = new Date().toISOString();

        // Логируем сохранение данных
        console.log('✅ Данные сохранены в память:');
        console.log(`Всего объектов в истории: ${lastAccessDataArray.length}`);
        console.log('lastAccessTimestamp:', lastAccessTimestamp);

        // Отправляем успешный ответ
        res.status(200).json({
            message: 'Данные успешно получены',
            received: true,
            count: parsedData.length,
            data: lastAccessData,
            allData: parsedData,
            hexData: hexData ? formatHex(hexData) : null,
            timestamp: lastAccessTimestamp
        });
    } catch (error) {
        console.error('Ошибка при получении данных от access.exe:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: 'Ошибка обработки данных',
            message: error.message
        });
    }
};

// Очистка данных (для удаления тестовых данных)
exports.clearData = async (req, res) => {
    try {
        console.log('🧹 Очистка данных от access.exe');
        lastAccessData = null;
        lastAccessDataArray = [];
        lastHexData = null;
        lastAccessTimestamp = null;
        receiveDataCount = 0;
        getLastDataCount = 0;

        res.status(200).json({
            message: 'Данные успешно очищены',
            cleared: true
        });
    } catch (error) {
        console.error('Ошибка при очистке данных:', error);
        res.status(500).json({
            error: 'Ошибка очистки данных',
            message: error.message
        });
    }
};

// Получение последних данных от access.exe
exports.getLastData = async (req, res) => {
    try {
        getLastDataCount++;
        // Логируем запрос для отладки
        console.log('='.repeat(50));
        console.log(`📥 GET /api/access/last запрос #${getLastDataCount}:`);
        console.log('lastAccessData:', lastAccessData ? 'ЕСТЬ ДАННЫЕ' : 'НЕТ ДАННЫХ');
        console.log('Всего объектов в истории:', lastAccessDataArray.length);

        // Фильтруем тестовые данные из ответа, если есть реальные данные
        const realDataArray = lastAccessDataArray.filter(d => d.test !== true);
        const hasRealData = realDataArray.length > 0;
        const hasTestData = lastAccessDataArray.some(d => d.test === true);

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
                hasTestData: false
            });
        }

        // Возвращаем реальные данные, если они есть, иначе все данные
        const dataToReturn = hasRealData ? realDataArray : lastAccessDataArray;
        const lastDataToReturn = hasRealData && realDataArray.length > 0
            ? (realDataArray.length === 1 ? realDataArray[0] : realDataArray)
            : lastAccessData;

        res.status(200).json({
            message: 'Последние данные от access.exe',
            data: lastDataToReturn, // Последний объект или массив (без тестовых, если есть реальные)
            allData: dataToReturn, // Все полученные объекты (без тестовых, если есть реальные)
            count: dataToReturn.length,
            hexData: lastHexData,
            timestamp: lastAccessTimestamp,
            hasRealData: hasRealData,
            hasTestData: hasTestData,
            totalCount: lastAccessDataArray.length // Общее количество (включая тестовые)
        });
    } catch (error) {
        console.error('Ошибка при получении последних данных:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: 'Ошибка получения данных',
            message: error.message
        });
    }
};

