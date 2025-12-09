//* Скрипт для создания БД, если она не существует

const { Client } = require('pg');

//? Конфигурация подключения к PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: 'postgres', //? Подключаемся к системной БД для создания новой
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

//? Имя целевой БД
const targetDbName = process.env.DB_NAME || 'monitoring_docker';

//? Функция для создания БД, если она не существует
async function createDatabaseIfNotExists() {
  const client = new Client(dbConfig);

  try {
    await client.connect(); //? Подключаемся к PostgreSQL
    console.log(`🔍 Проверка существования БД "${targetDbName}"...`);

    //? Проверяем, существует ли БД
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    //! Если БД существует, выводим сообщение и закрываем соединение
    if (result.rows.length > 0) {
      console.log(`✅ БД "${targetDbName}" уже существует`);
      await client.end();
      return;
    }

    //? Создаем БД
    console.log(`📦 Создание БД "${targetDbName}"...`);
    await client.query(`CREATE DATABASE "${targetDbName}"`);
    console.log(`✅ БД "${targetDbName}" успешно создана`);

    await client.end(); //? Закрываем соединение
  } catch (error) {
    //! Если ошибка "database already exists" - это нормально
    if (error.message.includes('already exists')) {
      console.log(`✅ БД "${targetDbName}" уже существует`);
      await client.end(); //! Закрываем соединение
      return;
    }

    console.error(`❌ Ошибка при создании БД: ${error.message}`);
    await client.end(); //! Закрываем соединение
    process.exit(1);
  }
}

createDatabaseIfNotExists();
