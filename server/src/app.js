const cors = require('cors');
const path = require('path');

// Загружаем .env файл явно из директории server (абсолютный путь)
// Пробуем несколько возможных путей
const possiblePaths = [
    '/var/www/www-root/data/www/mon.incfw.com/server/.env',
    path.join(__dirname, '../../.env'),
    path.join(process.cwd(), '.env'),
];

let envLoaded = false;
for (const envPath of possiblePaths) {
    try {
        const result = require('dotenv').config({ path: envPath });
        if (!result.error) {
            console.log('✅ .env загружен из:', envPath);
            envLoaded = true;
            break;
        }
    } catch (e) {
        // Продолжаем пробовать другие пути
    }
}

if (!envLoaded) {
    console.warn('⚠️ Не удалось загрузить .env файл. Пробовали пути:', possiblePaths);
}

// Отладочный вывод переменных окружения (без значений для безопасности)
console.log('🔍 Проверка переменных окружения:');
console.log('  PORT:', process.env.PORT ? 'SET' : 'NOT SET');
console.log(
    '  ACCESS_TOKEN_SECRET:',
    process.env.ACCESS_TOKEN_SECRET
        ? 'SET (' + process.env.ACCESS_TOKEN_SECRET.length + ' chars)'
        : 'NOT SET'
);
console.log(
    '  REFRESH_TOKEN_SECRET:',
    process.env.REFRESH_TOKEN_SECRET
        ? 'SET (' + process.env.REFRESH_TOKEN_SECRET.length + ' chars)'
        : 'NOT SET'
);
console.log('  SECRET_KEY:', process.env.SECRET_KEY ? 'SET' : 'NOT SET');
console.log('  REDIS_HOST:', process.env.REDIS_HOST || 'localhost (default)');
console.log('  REDIS_PORT:', process.env.REDIS_PORT || '6379 (default)');

const express = require('express');
const serverConfig = require('./config/serverConfig');
const { initRedis, testConnection } = require('./config/redisConfig');
// const indexRouter = require("./routes/index.routes");
const PORT = process.env.PORT ?? 3000;
const cookieParser = require('cookie-parser');
const http = require('http');
const websocketService = require('./services/websocketService');

const app = express();
const server = http.createServer(app);

// Разрешить все источники (для разработки и access.exe)
app.use(
    cors({
        origin: function (origin, callback) {
            // Разрешаем запросы без origin (например, от access.exe или Postman)
            if (!origin) return callback(null, true);
            // Разрешаем запросы от клиента и других разрешенных источников
            const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                // Для access.exe и других внешних источников также разрешаем
                callback(null, true);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-API-Key'],
    })
);

//конфигурация
serverConfig(app);
app.use(cookieParser());

// Обработка POST запросов на корневой путь от access.exe (ДО других маршрутов!)
const { receiveData } = require('./controllers/accessController');
const verifyAccessExeToken = require('./middleware/verifyAccessExeToken');

// Middleware для приема бинарных данных на корневом пути (от access.exe)
// Поддерживаем как обычные данные, так и gzip архивы
app.post(
    '/',
    express.raw({ type: ['*/*', 'application/gzip'], limit: '50mb' }),
    (req, res, next) => {
        console.log('\n🎯 POST запрос на корневой путь /');
        console.log('  Content-Type:', req.headers['content-type']);
        console.log('  X-Filename:', req.headers['x-filename'] || '(не указан)');
        console.log('  Content-Length:', req.headers['content-length'] || '(не указан)');

        // Сохраняем raw buffer для последующей обработки
        if (req.body && Buffer.isBuffer(req.body)) {
            req.rawBuffer = req.body;
            req.isGzip = req.headers['content-type'] === 'application/gzip';
            req.filename = req.headers['x-filename'] || null;
            console.log('✅ Raw buffer сохранен, размер:', req.rawBuffer.length, 'байт');
            console.log('  Это gzip архив:', req.isGzip ? 'ДА' : 'НЕТ');
        }
        next();
    },
    verifyAccessExeToken,
    receiveData
);

// Обработка POST запросов на /api от access.exe (ПЕРЕД app.use('/api', indexRouter))
app.post(
    '/api',
    express.raw({ type: ['*/*', 'application/gzip'], limit: '50mb' }),
    (req, res, next) => {
        console.log('\n🎯 POST запрос на /api');
        console.log('  Content-Type:', req.headers['content-type']);
        console.log('  X-Filename:', req.headers['x-filename'] || '(не указан)');
        console.log('  Content-Length:', req.headers['content-length'] || '(не указан)');

        // Сохраняем raw buffer для последующей обработки
        if (req.body && Buffer.isBuffer(req.body)) {
            req.rawBuffer = req.body;
            req.isGzip = req.headers['content-type'] === 'application/gzip';
            req.filename = req.headers['x-filename'] || null;
            console.log('✅ Raw buffer сохранен, размер:', req.rawBuffer.length, 'байт');
            console.log('  Это gzip архив:', req.isGzip ? 'ДА' : 'НЕТ');
        }
        next();
    },
    verifyAccessExeToken,
    receiveData
);

//мaршрутизация
const indexRouter = require('./routes/index.routes');
app.use('/api', indexRouter);
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// GET запрос на корневой путь
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Инициализация Redis и запуск сервера
async function startServer() {
    const { waitForRedis } = require('./config/redisConfig');
    const SKIP_REDIS_WAIT = process.env.SKIP_REDIS_WAIT === 'true';
    const WAIT_FOR_REDIS = process.env.WAIT_FOR_REDIS !== 'false'; // По умолчанию true

    // Ожидаем Redis, если не пропущено
    if (WAIT_FOR_REDIS && !SKIP_REDIS_WAIT) {
        console.log('🔄 Ожидание подключения к Redis...');
        const redisAvailable = await waitForRedis(30, 1000);

        if (!redisAvailable) {
            console.error('❌ Redis недоступен. Сервер не будет запущен.');
            console.error('   Запустите Redis или установите SKIP_REDIS_WAIT=true для запуска без Redis');
            process.exit(1);
        }
    }

    try {
        // Инициализируем Redis
        console.log('🔄 Инициализация Redis...');
        await initRedis();

        // Проверяем подключение
        const isConnected = await testConnection();
        if (isConnected) {
            console.log('✅ Redis успешно подключен и готов к работе');
        } else {
            console.warn('⚠️ Redis подключен, но проверка соединения не прошла');
        }
    } catch (error) {
        if (SKIP_REDIS_WAIT) {
            console.warn('⚠️ Сервер будет работать без Redis. Некоторые функции могут быть недоступны.');
            console.warn(
                '⚠️ Убедитесь, что Redis запущен и доступен по адресу:',
                `${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
            );
        } else {
            console.error('❌ Ошибка инициализации Redis:', error.message);
            console.error('   Сервер не будет запущен. Проверьте подключение к Redis.');
            process.exit(1);
        }
    }

    // Инициализируем WebSocket сервер
    websocketService.initialize(server);

    // Запускаем сервер
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Сервер запущен на порту ${PORT} (0.0.0.0)`);
        console.log(`📡 Server is accessible at http://localhost:${PORT}`);
        console.log(`🔌 WebSocket сервер готов к подключениям`);
    });
}

// Обработка завершения процесса
process.on('SIGTERM', async () => {
    console.log('🛑 Получен сигнал SIGTERM, завершаем работу...');
    const { closeRedis } = require('./config/redisConfig');
    await closeRedis();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Получен сигнал SIGINT, завершаем работу...');
    const { closeRedis } = require('./config/redisConfig');
    await closeRedis();
    process.exit(0);
});

// Запускаем сервер
startServer();
