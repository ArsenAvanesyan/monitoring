const { User } = require('../../db/models');
const RedisService = require('./redisService');

//? TTL для кэша пользователей (в секундах)
const CACHE_TTL = {
  USER: 300, //? 5 минут для обычных данных пользователя
  TOKEN: 60, //? 1 минута для токенов (могут часто меняться)
};

//? Генерация ключей для Redis
const getCacheKey = {
  userById: (id) => `user:id:${id}`,
  userByEmail: (email) => `user:email:${email.toLowerCase()}`,
  userByLogin: (login) => `user:login:${login}`,
  userByToken: (token) => `user:token:${token}`,
};

//? Инвалидация кэша пользователя
async function invalidateUserCache(user) {
  try {
    if (!user) return;

    const keys = [];
    if (user.id) keys.push(getCacheKey.userById(user.id));
    if (user.email) keys.push(getCacheKey.userByEmail(user.email));
    if (user.login) keys.push(getCacheKey.userByLogin(user.login));
    if (user.token) keys.push(getCacheKey.userByToken(user.token));

    if (keys.length > 0) {
      await RedisService.deleteMany(keys);
    }
  } catch (error) {
    //! Игнорируем ошибки кэша, не критично
    console.warn('Предупреждение: не удалось инвалидировать кэш пользователя:', error.message);
  }
}

class UserServices {
  static async addUser({ login, password, token, email, photo }) {
    try {
      const user = await User.create({
        login,
        password,
        token,
        email,
        photo,
      });
      const userData = user ? user.get() : null;

      //? Кэшируем нового пользователя
      if (userData) {
        try {
          await RedisService.set(getCacheKey.userById(userData.id), userData, CACHE_TTL.USER);
          if (userData.email) {
            await RedisService.set(
              getCacheKey.userByEmail(userData.email),
              userData,
              CACHE_TTL.USER
            );
          }
          if (userData.login) {
            await RedisService.set(
              getCacheKey.userByLogin(userData.login),
              userData,
              CACHE_TTL.USER
            );
          }
          if (userData.token) {
            await RedisService.set(
              getCacheKey.userByToken(userData.token),
              userData,
              CACHE_TTL.TOKEN
            );
          }
        } catch (cacheError) {
          //! Игнорируем ошибки кэша при создании
          console.warn(
            'Предупреждение: не удалось закэшировать нового пользователя:',
            cacheError.message
          );
        }
      }

      return userData;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getUserByEmail(email) {
    try {
      //? Пытаемся получить из кэша
      const cacheKey = getCacheKey.userByEmail(email);
      try {
        const cachedUser = await RedisService.get(cacheKey);
        if (cachedUser) {
          console.log(`✅ [CACHE HIT] Пользователь получен из Redis: ${cacheKey}`);
          return cachedUser;
        }
      } catch (cacheError) {
        //! Если кэш недоступен, продолжаем запрос к БД
        console.warn(
          'Предупреждение: не удалось получить пользователя из кэша:',
          cacheError.message
        );
      }

      //? Получаем из БД
      console.log(`⏳ [CACHE MISS] Пользователь не найден в кэше, запрос к БД: ${email}`);
      const user = await User.findOne({ where: { email } });
      const userData = user ? user.get() : null;

      //? Кэшируем результат
      if (userData) {
        try {
          await RedisService.set(cacheKey, userData, CACHE_TTL.USER);
          console.log(
            `💾 [CACHE SET] Пользователь сохранен в Redis: ${cacheKey} (TTL: ${CACHE_TTL.USER}s)`
          );
          //? Также кэшируем по ID для быстрого доступа
          await RedisService.set(getCacheKey.userById(userData.id), userData, CACHE_TTL.USER);
        } catch (cacheError) {
          console.warn('Предупреждение: не удалось закэшировать пользователя:', cacheError.message);
        }
      }

      return userData;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getUserByLogin(login) {
    try {
      //? Пытаемся получить из кэша
      const cacheKey = getCacheKey.userByLogin(login);
      try {
        const cachedUser = await RedisService.get(cacheKey);
        if (cachedUser) {
          console.log(`✅ [CACHE HIT] Пользователь получен из Redis: ${cacheKey}`);
          return cachedUser;
        }
      } catch (cacheError) {
        console.warn(
          'Предупреждение: не удалось получить пользователя из кэша:',
          cacheError.message
        );
      }

      //? Получаем из БД
      console.log(`⏳ [CACHE MISS] Пользователь не найден в кэше, запрос к БД: ${login}`);
      const user = await User.findOne({ where: { login } });
      const userData = user ? user.get() : null;

      //? Кэшируем результат
      if (userData) {
        try {
          await RedisService.set(cacheKey, userData, CACHE_TTL.USER);
          console.log(
            `💾 [CACHE SET] Пользователь сохранен в Redis: ${cacheKey} (TTL: ${CACHE_TTL.USER}s)`
          );
          await RedisService.set(getCacheKey.userById(userData.id), userData, CACHE_TTL.USER);
        } catch (cacheError) {
          console.warn('Предупреждение: не удалось закэшировать пользователя:', cacheError.message);
        }
      }

      return userData;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async updateUser(userId, updateData) {
    try {
      console.log('UserServices: Обновляем пользователя ID:', userId, 'с данными:', updateData);

      //? Получаем старые данные пользователя для инвалидации кэша
      const oldUser = await User.findByPk(userId);
      const oldUserData = oldUser ? oldUser.get() : null;

      const [updatedRowsCount] = await User.update(updateData, {
        where: { id: userId },
      });

      console.log('UserServices: Количество обновленных строк:', updatedRowsCount);

      const user = await User.findByPk(userId);
      const userData = user ? user.get() : null;
      console.log('UserServices: Найденный пользователь после обновления:', userData);

      //? Инвалидируем старый кэш
      if (oldUserData) {
        await invalidateUserCache(oldUserData);
      }

      //? Кэшируем обновленные данные
      if (userData) {
        try {
          await RedisService.set(getCacheKey.userById(userData.id), userData, CACHE_TTL.USER);
          if (userData.email) {
            await RedisService.set(
              getCacheKey.userByEmail(userData.email),
              userData,
              CACHE_TTL.USER
            );
          }
          if (userData.login) {
            await RedisService.set(
              getCacheKey.userByLogin(userData.login),
              userData,
              CACHE_TTL.USER
            );
          }
          if (userData.token) {
            await RedisService.set(
              getCacheKey.userByToken(userData.token),
              userData,
              CACHE_TTL.TOKEN
            );
          }
        } catch (cacheError) {
          console.warn(
            'Предупреждение: не удалось закэшировать обновленного пользователя:',
            cacheError.message
          );
        }
      }

      return userData;
    } catch (error) {
      console.error('UserServices: Ошибка обновления пользователя:', error);
      throw new Error(error);
    }
  }

  static async getAllUsers(where = {}) {
    try {
      const users = await User.findAll({ where });
      return users.map((user) => user.get());
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getUserById(id) {
    try {
      //? Пытаемся получить из кэша
      const cacheKey = getCacheKey.userById(id);
      try {
        const cachedUser = await RedisService.get(cacheKey);
        if (cachedUser) {
          console.log(`✅ [CACHE HIT] Пользователь получен из Redis: ${cacheKey}`);
          return cachedUser;
        }
      } catch (cacheError) {
        console.warn(
          'Предупреждение: не удалось получить пользователя из кэша:',
          cacheError.message
        );
      }

      //? Получаем из БД
      console.log(`⏳ [CACHE MISS] Пользователь не найден в кэше, запрос к БД: ID ${id}`);
      const user = await User.findOne({ where: { id } });
      const userData = user ? user.get() : null;

      //? Кэшируем результат
      if (userData) {
        try {
          await RedisService.set(cacheKey, userData, CACHE_TTL.USER);
          console.log(
            `💾 [CACHE SET] Пользователь сохранен в Redis: ${cacheKey} (TTL: ${CACHE_TTL.USER}s)`
          );
        } catch (cacheError) {
          console.warn('Предупреждение: не удалось закэшировать пользователя:', cacheError.message);
        }
      }

      return userData;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getUserByPhone(phone) {
    try {
      const user = await User.findOne({ where: { phone } });
      return user ? user.get() : null;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async getUserByToken(token) {
    try {
      //? Пытаемся получить из кэша
      const cacheKey = getCacheKey.userByToken(token);
      try {
        const cachedUser = await RedisService.get(cacheKey);
        if (cachedUser) {
          console.log(`✅ [CACHE HIT] Пользователь получен из Redis: ${cacheKey}`);
          return cachedUser;
        }
      } catch (cacheError) {
        console.warn(
          'Предупреждение: не удалось получить пользователя из кэша:',
          cacheError.message
        );
      }

      //? Получаем из БД
      console.log(`⏳ [CACHE MISS] Пользователь не найден в кэше, запрос к БД: token`);
      const user = await User.findOne({ where: { token } });
      const userData = user ? user.get() : null;

      //? Кэшируем результат (короткий TTL для токенов)
      if (userData) {
        try {
          await RedisService.set(cacheKey, userData, CACHE_TTL.TOKEN);
          console.log(
            `💾 [CACHE SET] Пользователь сохранен в Redis: ${cacheKey} (TTL: ${CACHE_TTL.TOKEN}s)`
          );
          await RedisService.set(getCacheKey.userById(userData.id), userData, CACHE_TTL.USER);
        } catch (cacheError) {
          console.warn('Предупреждение: не удалось закэшировать пользователя:', cacheError.message);
        }
      }

      return userData;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = UserServices;
