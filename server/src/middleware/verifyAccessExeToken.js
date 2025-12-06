// ./middleware/verifyAccessExeToken.js

require("dotenv").config();
const UserServices = require("../services/UserServices");

/**
 * Middleware для проверки токена от access.exe
 * Токен может быть передан в заголовке Authorization или в query параметре token
 * Токен проверяется по полю token в таблице User
 */
async function verifyAccessExeToken(req, res, next) {
  try {
    let token = null;

    // Логируем заголовки для отладки
    console.log('🔍 Проверка токена access.exe:');
    console.log('  Authorization header:', req.headers.authorization ? 'present' : 'missing');
    console.log('  Query token:', req.query.token ? 'present' : 'missing');
    console.log('  Body token:', (req.body && typeof req.body === 'object' && req.body.token) ? 'present' : 'missing');

    // Пытаемся получить токен из заголовка Authorization
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      // Проверяем формат "Bearer token" или просто "token"
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(" ")[1];
        console.log('  ✅ Токен найден в Authorization header (Bearer format)');
      } else {
        token = authHeader;
        console.log('  ✅ Токен найден в Authorization header (plain format)');
      }
    }

    // Если токена нет в заголовке, пытаемся получить из query параметров
    if (!token && req.query.token) {
      token = req.query.token;
      console.log('  ✅ Токен найден в query параметрах');
    }

    // Если токена нет в query, пытаемся получить из тела запроса (если это JSON)
    if (!token && req.body && typeof req.body === 'object' && req.body.token) {
      token = req.body.token;
      console.log('  ✅ Токен найден в теле запроса');
    }

    if (!token) {
      console.log('❌ Access.exe token not provided');
      console.log('  Доступные способы передачи токена:');
      console.log('    1. Заголовок: Authorization: Bearer YOUR_TOKEN');
      console.log('    2. Заголовок: Authorization: YOUR_TOKEN');
      console.log('    3. Query параметр: ?token=YOUR_TOKEN');
      console.log('    4. В теле запроса (JSON): {"token": "YOUR_TOKEN", ...}');
      return res.status(401).json({ 
        message: "Токен доступа не предоставлен. Необходима авторизация для получения данных от access.exe. Получите токен в профиле пользователя и добавьте его в запрос." 
      });
    }

    // Ищем пользователя по токену
    const user = await UserServices.getUserByToken(token);

    if (!user) {
      console.log('❌ Invalid access.exe token:', token.substring(0, 10) + '...');
      return res.status(401).json({ 
        message: "Неверный токен доступа. Необходима авторизация для получения данных от access.exe." 
      });
    }

    // Сохраняем пользователя в res.locals для использования в контроллере
    res.locals.user = user;
    console.log('✅ Access.exe token verified for user:', user.login || user.email);

    next();
  } catch (error) {
    console.error('Ошибка при проверке токена access.exe:', error);
    return res.status(500).json({ 
      message: "Ошибка проверки токена доступа",
      error: error.message 
    });
  }
}

module.exports = verifyAccessExeToken;

