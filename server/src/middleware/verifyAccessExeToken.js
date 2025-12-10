// ./middleware/verifyAccessExeToken.js

require('dotenv').config();
const UserServices = require('../services/UserServices');

/**
 * Middleware для проверки токена от access.exe
 * Токен должен быть передан в заголовке X-API-Key
 * Токен проверяется по полю token в таблице User
 * Если токен неверный - соединение закрывается
 */
async function verifyAccessExeToken(req, res, next) {
  try {
    // Получаем токен из заголовка X-API-Key
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

    // Логируем информацию о попытке отправки данных
    console.log('\n' + '🚫'.repeat(40));
    console.log('🔒 ПРОВЕРКА ТОКЕНА ДОСТУПА');
    console.log('🚫'.repeat(40));
    console.log('📡 Попытка отправки данных от access.exe:');
    console.log('  IP:', req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress);
    console.log('  URL:', req.originalUrl);
    console.log('  Method:', req.method);
    console.log('  Content-Type:', req.headers['content-type'] || '(не указан)');
    console.log('  Content-Length:', req.headers['content-length'] || '(не указан)');
    console.log(
      '  X-API-Key header:',
      apiKey ? `present (${apiKey.substring(0, 10)}...)` : 'MISSING ❌'
    );

    // Пытаемся получить информацию о данных (если они есть)
    if (req.rawBuffer && Buffer.isBuffer(req.rawBuffer)) {
      const dataPreview = req.rawBuffer.toString('utf8').substring(0, 200);
      console.log('  📦 Данные (первые 200 символов):', dataPreview);
      console.log('  📦 Размер данных:', req.rawBuffer.length, 'байт');
    } else if (req.body && typeof req.body === 'string') {
      console.log('  📦 Данные (первые 200 символов):', req.body.substring(0, 200));
      console.log('  📦 Размер данных:', req.body.length, 'символов');
    }

    if (!apiKey) {
      console.log('\n❌ ОТКЛОНЕНО: Токен доступа не предоставлен в заголовке X-API-Key');
      console.log('⚠️  Соединение будет закрыто, данные не будут обработаны');
      console.log('🚫'.repeat(40) + '\n');

      // Отправляем ответ и закрываем соединение
      res.status(401).json({
        message:
          'Токен доступа не предоставлен. Токен должен быть в заголовке X-API-Key. Соединение закрыто.',
      });
      // Закрываем соединение
      if (req.destroy) {
        req.destroy();
      }
      if (res.destroy) {
        res.destroy();
      }
      return;
    }

    // Ищем пользователя по токену
    console.log('🔍 Проверка токена в базе данных...');
    const user = await UserServices.getUserByToken(apiKey);

    if (!user) {
      console.log('\n❌ ОТКЛОНЕНО: Неверный токен доступа');
      console.log('  Токен (первые 20 символов):', apiKey.substring(0, 20) + '...');
      console.log('  ⚠️  Токен не найден в базе данных');
      console.log('  ⚠️  Соединение будет закрыто, данные не будут обработаны');
      console.log('🚫'.repeat(40) + '\n');

      // Отправляем ответ и закрываем соединение
      res.status(401).json({
        message: 'Неверный токен доступа. Соединение закрыто.',
      });
      // Закрываем соединение
      if (req.destroy) {
        req.destroy();
      }
      if (res.destroy) {
        res.destroy();
      }
      return;
    }

    // Сохраняем пользователя в res.locals для использования в контроллере
    res.locals.user = user;
    console.log('\n✅ ТОКЕН ПОДТВЕРЖДЕН');
    console.log('  Пользователь:', user.login || user.email);
    console.log('  ID пользователя:', user.id);
    console.log('  ✅ Соединение установлено, данные будут обработаны');
    console.log('🚫'.repeat(40) + '\n');

    next();
  } catch (error) {
    console.error('\n❌ ОШИБКА при проверке токена access.exe:', error);
    console.error('  Stack:', error.stack);
    console.log('  ⚠️  Соединение будет закрыто из-за ошибки');
    console.log('🚫'.repeat(40) + '\n');

    // Отправляем ответ и закрываем соединение при ошибке
    res.status(500).json({
      message: 'Ошибка проверки токена доступа',
      error: error.message,
    });
    // Закрываем соединение
    if (req.destroy) {
      req.destroy();
    }
    if (res.destroy) {
      res.destroy();
    }
  }
}

module.exports = verifyAccessExeToken;
