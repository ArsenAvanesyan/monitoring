const { createClient } = require('redis');

//* Конфигурация подключения к Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    //? Экспоненциальная задержка при переподключении
    const delay = Math.min(times * 50, 2000);
    console.log(`🔄 Попытка переподключения к Redis через ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,
};

//? Создаем клиент Redis
let redisClient = null;

//? Инициализация подключения к Redis
async function initRedis() {
  try {
    if (redisClient && redisClient.isOpen) {
      console.log('✅ Redis уже подключен');
      return redisClient;
    }

    redisClient = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        reconnectStrategy: redisConfig.retryStrategy,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    //! Обработка ошибок подключения
    redisClient.on('error', (err) => {
      console.error('❌ Ошибка подключения к Redis:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Подключение к Redis...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis подключен и готов к работе');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Переподключение к Redis...');
    });

    redisClient.on('end', () => {
      console.log('⚠️ Соединение с Redis закрыто');
    });

    //? Подключаемся к Redis
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Ошибка инициализации Redis:', error);
    throw error;
  }
}

//? Получение клиента Redis
function getRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis клиент не инициализирован. Вызовите initRedis() сначала.');
  }
  return redisClient;
}

//? Закрытие подключения к Redis
async function closeRedis() {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log('✅ Соединение с Redis закрыто');
    }
  } catch (error) {
    console.error('❌ Ошибка при закрытии Redis:', error);
  }
}

//? Проверка подключения к Redis
async function testConnection() {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('❌ Ошибка проверки подключения Redis:', error);
    return false;
  }
}

//? Ожидание подключения к Redis с повторными попытками
async function waitForRedis(maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      //? Пытаемся создать временное подключение для проверки
      const testClient = createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
          connectTimeout: 2000,
        },
        password: redisConfig.password,
        database: redisConfig.db,
      });

      await testClient.connect();
      await testClient.ping();
      await testClient.quit();

      console.log(`✅ Redis доступен после ${attempt} попытки(ок)`);
      return true;
    } catch (error) {
      if (attempt < maxAttempts) {
        console.log(`⏳ Ожидание Redis... (попытка ${attempt}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error(`❌ Redis недоступен после ${maxAttempts} попыток`);
        return false;
      }
    }
  }
  return false;
}

module.exports = {
  initRedis,
  getRedisClient,
  closeRedis,
  testConnection,
  waitForRedis,
  redisConfig,
};
