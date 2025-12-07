const { getRedisClient } = require('../config/redisConfig');

//? Сервис для работы с Redis
class RedisService {
  static async set(key, value, ttl = null) {
    try {
      const client = getRedisClient();
      const serializedValue = JSON.stringify(value);

      if (ttl) {
        await client.setEx(key, ttl, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      console.error(`❌ Ошибка сохранения в Redis (key: ${key}):`, error);
      throw error;
    }
  }

  static async get(key) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);

      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`❌ Ошибка получения из Redis (key: ${key}):`, error);
      return null;
    }
  }

  static async delete(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка удаления из Redis (key: ${key}):`, error);
      throw error;
    }
  }

  static async deleteMany(keys) {
    try {
      if (!Array.isArray(keys) || keys.length === 0) {
        return true;
      }

      const client = getRedisClient();
      await client.del(keys);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка удаления нескольких ключей из Redis:`, error);
      throw error;
    }
  }

  static async exists(key) {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        `❌ Ошибка проверки существования ключа (key: ${key}):`,
        error
      );
      return false;
    }
  }

  static async expire(key, seconds) {
    try {
      const client = getRedisClient();
      await client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка установки TTL (key: ${key}):`, error);
      throw error;
    }
  }

  static async getTTL(key) {
    try {
      const client = getRedisClient();
      const ttl = await client.ttl(key);
      return ttl;
    } catch (error) {
      console.error(`❌ Ошибка получения TTL (key: ${key}):`, error);
      return -1;
    }
  }

  static async pushToList(key, value, maxLength = null) {
    try {
      const client = getRedisClient();
      const serializedValue = JSON.stringify(value);

      await client.rPush(key, serializedValue);

      //? Ограничиваем размер списка, если указан maxLength
      if (maxLength) {
        await client.lTrim(key, -maxLength, -1);
      }

      return true;
    } catch (error) {
      console.error(
        `❌ Ошибка добавления в список Redis (key: ${key}):`,
        error
      );
      throw error;
    }
  }

  static async getList(key, start = 0, end = -1) {
    try {
      const client = getRedisClient();
      const values = await client.lRange(key, start, end);

      return values.map((v) => {
        try {
          return JSON.parse(v);
        } catch (e) {
          return v;
        }
      });
    } catch (error) {
      console.error(
        `❌ Ошибка получения списка из Redis (key: ${key}):`,
        error
      );
      return [];
    }
  }

  static async getListLength(key) {
    try {
      const client = getRedisClient();
      return await client.lLen(key);
    } catch (error) {
      console.error(`❌ Ошибка получения длины списка (key: ${key}):`, error);
      return 0;
    }
  }

  static async clearList(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка очистки списка (key: ${key}):`, error);
      throw error;
    }
  }

  static async setHash(key, field, value) {
    try {
      const client = getRedisClient();
      const serializedValue = JSON.stringify(value);
      await client.hSet(key, field, serializedValue);
      return true;
    } catch (error) {
      console.error(
        `❌ Ошибка сохранения хеша в Redis (key: ${key}, field: ${field}):`,
        error
      );
      throw error;
    }
  }

  static async getHash(key, field) {
    try {
      const client = getRedisClient();
      const value = await client.hGet(key, field);

      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(
        `❌ Ошибка получения хеша из Redis (key: ${key}, field: ${field}):`,
        error
      );
      return null;
    }
  }

  static async getAllHash(key) {
    try {
      const client = getRedisClient();
      const hash = await client.hGetAll(key);

      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch (e) {
          result[field] = value;
        }
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Ошибка получения всех полей хеша (key: ${key}):`,
        error
      );
      return {};
    }
  }

  static async deleteHashField(key, field) {
    try {
      const client = getRedisClient();
      await client.hDel(key, field);
      return true;
    } catch (error) {
      console.error(
        `❌ Ошибка удаления поля хеша (key: ${key}, field: ${field}):`,
        error
      );
      throw error;
    }
  }

  static async increment(key, by = 1) {
    try {
      const client = getRedisClient();
      return await client.incrBy(key, by);
    } catch (error) {
      console.error(`❌ Ошибка инкремента (key: ${key}):`, error);
      throw error;
    }
  }

  static async decrement(key, by = 1) {
    try {
      const client = getRedisClient();
      return await client.decrBy(key, by);
    } catch (error) {
      console.error(`❌ Ошибка декремента (key: ${key}):`, error);
      throw error;
    }
  }

  static async findKeys(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      return keys;
    } catch (error) {
      console.error(`❌ Ошибка поиска ключей (pattern: ${pattern}):`, error);
      return [];
    }
  }
}

module.exports = RedisService;
