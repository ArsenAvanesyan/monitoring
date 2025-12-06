const cors = require('cors');
const path = require('path');

// Загружаем .env файл явно из директории server (абсолютный путь)
// Пробуем несколько возможных путей
const possiblePaths = [
  '/var/www/www-root/data/www/mon.incoel.ru/server/.env',
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), '.env')
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  try {
    const result = require("dotenv").config({ path: envPath });
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
console.log('  ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'SET (' + process.env.ACCESS_TOKEN_SECRET.length + ' chars)' : 'NOT SET');
console.log('  REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'SET (' + process.env.REFRESH_TOKEN_SECRET.length + ' chars)' : 'NOT SET');
console.log('  SECRET_KEY:', process.env.SECRET_KEY ? 'SET' : 'NOT SET');

const express = require("express");
const serverConfig = require("./config/serverConfig");
// const indexRouter = require("./routes/index.routes");
const PORT = process.env.PORT ?? 3000;
const cookieParser = require('cookie-parser');

const app = express();

// Разрешить все источники (для разработки и access.exe)
app.use(cors({
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

//конфигурация
serverConfig(app);
app.use(cookieParser());

// Обработка POST запросов на корневой путь от access.exe (ДО других маршрутов!)
const { receiveData } = require("./controllers/accessController");

// Middleware для приема бинарных данных на корневом пути (от access.exe)
// Без авторизации (пока)
app.post("/", express.raw({ type: '*/*', limit: '10mb' }), (req, res, next) => {
    console.log('\n🎯 POST запрос на корневой путь / от access.exe');
    // Сохраняем raw buffer для последующей обработки
    if (req.body && Buffer.isBuffer(req.body)) {
        req.rawBuffer = req.body;
        console.log('✅ Raw buffer сохранен, размер:', req.rawBuffer.length, 'байт');
    }
    next();
}, receiveData);

//мaршрутизация
const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// GET запрос на корневой путь
app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
});

// Слушаем на всех интерфейсах (0.0.0.0) для IPv4, чтобы nginx мог подключиться
app.listen(PORT, '0.0.0.0', () => {
    console.log(`listen port ${PORT} on 0.0.0.0`);
    console.log(`Server is accessible at http://localhost:${PORT}`);
});
