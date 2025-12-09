//? Скрипт для ожидания подключения к Redis перед запуском сервера

const { createClient } = require('redis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
};

const maxAttempts = parseInt(process.env.REDIS_MAX_ATTEMPTS || '30', 10);
const delayMs = parseInt(process.env.REDIS_WAIT_DELAY || '1000', 10);

async function waitForRedis() {
  console.log(
    `🔄 Ожидание подключения к Redis (${redisConfig.host}:${redisConfig.port})...`
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = createClient({
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
          connectTimeout: 2000,
        },
        password: redisConfig.password,
        database: redisConfig.db,
      });

      await client.connect();
      const result = await client.ping();
      await client.quit();

      if (result === 'PONG') {
        console.log(`✅ Redis доступен после ${attempt} попытки(ок)`);
        process.exit(0);
      }
    } catch (error) {
      if (attempt < maxAttempts) {
        process.stdout.write(`⏳ Попытка ${attempt}/${maxAttempts}... `);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        process.stdout.write('\r');
      } else {
        console.error(`\n❌ Redis недоступен после ${maxAttempts} попыток`);
        console.error(
          `   Проверьте, что Redis запущен на ${redisConfig.host}:${redisConfig.port}`
        );
        console.error(`   Ошибка: ${error.message}`);
        process.exit(1);
      }
    }
  }
}

waitForRedis();
