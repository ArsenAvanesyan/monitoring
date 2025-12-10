// ./utils/generateTokens.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

function generateTokens(payload) {
  // Проверка наличия секретных ключей
  if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error('❌ ACCESS_TOKEN_SECRET не установлен в переменных окружения');
    throw new Error('ACCESS_TOKEN_SECRET не установлен');
  }
  if (!process.env.REFRESH_TOKEN_SECRET) {
    console.error('❌ REFRESH_TOKEN_SECRET не установлен в переменных окружения');
    throw new Error('REFRESH_TOKEN_SECRET не установлен');
  }

  // payload - это объект с данными пользователя
  return {
    accessToken: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: jwtConfig.access.expiresIn,
    }),
    refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: jwtConfig.refresh.expiresIn,
    }),
  };
}

module.exports = generateTokens;
