//* Скрипт для ожидания подключения к PostgreSQL перед запуском сервера

const { Client } = require('pg');

//? Конфигурация подключения к PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'monitoring_docker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

//? Максимальное количество попыток и задержка между попытками
const maxAttempts = parseInt(process.env.DB_MAX_ATTEMPTS || '30', 10);

//? Задержка между попытками
const delayMs = parseInt(process.env.DB_WAIT_DELAY || '1000', 10);

//? Функция для ожидания подключения к PostgreSQL
async function waitForPostgres() {
  console.log(
    `🔄 Ожидание подключения к PostgreSQL (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})...`
  );

  //? Цикл для ожидания подключения к PostgreSQL
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      //? Создаем клиент PostgreSQL
      const client = new Client({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password,
        connectionTimeoutMillis: 2000,
      });

      await client.connect(); //? Подключаемся к PostgreSQL
      await client.query('SELECT 1'); //? Выполняем запрос
      await client.end(); //? Закрываем соединение

      console.log(`✅ PostgreSQL доступен после ${attempt} попытки(ок)`);
      process.exit(0); //? Выходим из скрипта
    } catch (error) {
      //! Если попытка не успешна, выводим сообщение и ждем следующую попытку
      if (attempt < maxAttempts) {
        process.stdout.write(`⏳ Попытка ${attempt}/${maxAttempts}... `);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        process.stdout.write('\r');
      } else {
        console.error(`\n❌ PostgreSQL недоступен после ${maxAttempts} попыток`);
        console.error(`   Проверьте, что PostgreSQL запущен на ${dbConfig.host}:${dbConfig.port}`);
        console.error(`   Ошибка: ${error.message}`);
        process.exit(1);
      }
    }
  }
}

waitForPostgres();
