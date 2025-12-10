const crypto = require('crypto');

/**
 * Генерирует случайный токен из 16 символов (8 байт)
 * @returns {string} Токен из 16 случайных символов в hex формате
 */
function generateToken() {
  // Генерируем 8 байт случайных данных
  const randomBytes = crypto.randomBytes(8);
  // Конвертируем в hex строку (16 символов)
  return randomBytes.toString('hex');
}

module.exports = generateToken;
