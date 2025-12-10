'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configData = require(__dirname + '/../config/config.json');
let config = configData[env];

// Если конфигурация для текущего окружения не найдена, используем development
if (!config) {
  console.warn(`⚠️ Configuration for environment "${env}" not found, using "development"`);
  config = configData['development'];
}

if (!config) {
  throw new Error(
    `Configuration not found in config.json. Available environments: ${Object.keys(configData).join(
      ', '
    )}`
  );
}

const db = {};

let sequelize;
//? Поддержка переменных окружения из Docker
if (process.env.DB_HOST) {
  //? Используем переменные окружения из Docker
  sequelize = new Sequelize(
    process.env.DB_NAME || config.database,
    process.env.DB_USER || config.username,
    process.env.DB_PASSWORD || config.password,
    {
      host: process.env.DB_HOST || config.host,
      port: process.env.DB_PORT || config.port || 5432,
      dialect: config.dialect || 'postgres',
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    }
  );
} else if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
