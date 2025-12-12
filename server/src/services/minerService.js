const { Miner } = require('../../db/models');
const { Op } = require('sequelize');

/**
 * Сервис для работы с данными майнеров в БД
 */
class MinerService {
  /**
   * Извлечение MAC адреса из данных майнера
   * @param {Object} minerData - данные майнера
   * @returns {string|null} MAC адрес или null
   */
  static extractMacAddress(minerData) {
    // Проверяем разные возможные поля для MAC адреса
    if (minerData.macAddress) return String(minerData.macAddress).trim();
    if (minerData.mac) return String(minerData.mac).trim();
    if (minerData.mtype?.sern) return String(minerData.mtype.sern).trim();
    if (minerData.mtype?.sn) return String(minerData.mtype.sn).trim();

    // Если MAC адрес не найден, возвращаем null
    return null;
  }

  /**
   * Нормализация IP адреса
   * @param {any} ip - IP адрес
   * @returns {string|null} нормализованный IP адрес
   */
  static normalizeIp(ip) {
    if (!ip) return null;
    const ipStr = String(ip).trim();
    return ipStr || null;
  }

  /**
   * Получение IP адреса из данных майнера
   * @param {Object} minerData - данные майнера
   * @returns {string|null} IP адрес или null
   */
  static extractIpAddress(minerData) {
    return (
      this.normalizeIp(minerData.ip) ||
      this.normalizeIp(minerData.ipAddress) ||
      this.normalizeIp(minerData.IP) ||
      null
    );
  }

  /**
   * Сохранение данных майнера в БД
   * @param {number} userId - ID пользователя
   * @param {Object} minerData - данные майнера от access.exe
   * @returns {Promise<Object>} сохраненная запись
   */
  static async saveMinerData(userId, minerData) {
    try {
      // Извлекаем MAC адрес и IP адрес
      const macAddress = this.extractMacAddress(minerData);
      const ipAddress = this.extractIpAddress(minerData);

      // Если нет ни MAC, ни IP - не можем сохранить
      if (!macAddress && !ipAddress) {
        throw new Error('Не удалось извлечь MAC адрес или IP адрес из данных майнера');
      }

      // Используем MAC адрес как основной идентификатор, если он есть
      // Иначе используем IP адрес
      const identifier = macAddress || ipAddress;
      const identifierField = macAddress ? 'macAddress' : 'ipAddress';

      console.log(`💾 Сохранение данных майнера: ${identifierField}=${identifier}`);

      // Подготавливаем данные для сохранения
      const dataToSave = {
        userId,
        macAddress: macAddress || ipAddress, // Если нет MAC, используем IP
        ipAddress: ipAddress || macAddress, // Если нет IP, используем MAC
        blink: minerData.blink || null,
        conf: minerData.conf || null,
        dtype: minerData.dtype || null,
        mtype: minerData.mtype || null,
        pools: minerData.pools || null,
        st: minerData.st || null,
        stats: minerData.stats || null,
        summ: minerData.summ || null,
        error: minerData.error || null,
        recordedAt: new Date(),
      };

      // Ищем существующую запись по MAC адресу (приоритет) или IP адресу
      const whereCondition = macAddress
        ? { userId, macAddress }
        : { userId, ipAddress };

      const [miner, created] = await Miner.findOrCreate({
        where: whereCondition,
        defaults: dataToSave,
      });

      if (!created) {
        // Обновляем существующую запись
        await miner.update(dataToSave);
        console.log(`  ✅ Обновлена существующая запись майнера: ${identifier}`);
      } else {
        console.log(`  ✅ Создана новая запись майнера: ${identifier}`);
      }

      return miner;
    } catch (error) {
      console.error('❌ Ошибка при сохранении данных майнера:', error);
      throw error;
    }
  }

  /**
   * Получение последних данных майнеров для пользователя
   * Приоритет: MAC адрес, если нет - IP адрес
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} массив последних данных майнеров
   */
  static async getLatestMinersData(userId) {
    try {
      console.log(`📥 Получение последних данных майнеров для пользователя: ${userId}`);

      // Получаем все записи пользователя, отсортированные по времени записи
      const allMiners = await Miner.findAll({
        where: { userId },
        order: [['recordedAt', 'DESC']],
      });

      if (allMiners.length === 0) {
        console.log('  ⚠️ Нет данных майнеров для пользователя');
        return [];
      }

      // Группируем по MAC адресу (приоритет) или IP адресу
      const latestMap = new Map();

      for (const miner of allMiners) {
        const key = miner.macAddress || miner.ipAddress;

        // Если еще нет записи для этого ключа, или текущая запись новее
        if (!latestMap.has(key) || miner.recordedAt > latestMap.get(key).recordedAt) {
          latestMap.set(key, miner);
        }
      }

      const latestMiners = Array.from(latestMap.values());

      // Преобразуем в формат, совместимый с форматом от access.exe
      const formattedData = latestMiners.map((miner) => {
        const minerData = miner.get({ plain: true });
        return {
          ip: minerData.ipAddress,
          macAddress: minerData.macAddress,
          blink: minerData.blink,
          conf: minerData.conf,
          dtype: minerData.dtype,
          mtype: minerData.mtype,
          pools: minerData.pools,
          st: minerData.st,
          stats: minerData.stats,
          summ: minerData.summ,
          error: minerData.error,
        };
      });

      console.log(`  ✅ Получено ${formattedData.length} уникальных майнеров`);
      return formattedData;
    } catch (error) {
      console.error('❌ Ошибка при получении данных майнеров:', error);
      throw error;
    }
  }

  /**
   * Получение последних данных майнеров по IP адресу (приоритет IP)
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>} массив последних данных майнеров
   */
  static async getLatestMinersDataByIp(userId) {
    try {
      console.log(`📥 Получение последних данных майнеров по IP для пользователя: ${userId}`);

      const allMiners = await Miner.findAll({
        where: { userId },
        order: [['recordedAt', 'DESC']],
      });

      if (allMiners.length === 0) {
        return [];
      }

      // Группируем по IP адресу (приоритет IP)
      const latestMap = new Map();

      for (const miner of allMiners) {
        const key = miner.ipAddress;

        if (!latestMap.has(key) || miner.recordedAt > latestMap.get(key).recordedAt) {
          latestMap.set(key, miner);
        }
      }

      const latestMiners = Array.from(latestMap.values());

      const formattedData = latestMiners.map((miner) => {
        const minerData = miner.get({ plain: true });
        return {
          ip: minerData.ipAddress,
          macAddress: minerData.macAddress,
          blink: minerData.blink,
          conf: minerData.conf,
          dtype: minerData.dtype,
          mtype: minerData.mtype,
          pools: minerData.pools,
          st: minerData.st,
          stats: minerData.stats,
          summ: minerData.summ,
          error: minerData.error,
        };
      });

      return formattedData;
    } catch (error) {
      console.error('❌ Ошибка при получении данных майнеров по IP:', error);
      throw error;
    }
  }

  /**
   * Очистка старых данных майнеров
   * @param {number} userId - ID пользователя
   * @param {string} retentionPeriod - период хранения ('week', 'month', 'half-year', 'year')
   * @returns {Promise<number>} количество удаленных записей
   */
  static async cleanupOldMinerData(userId, retentionPeriod = 'half-year') {
    try {
      const retentionPeriods = {
        week: 7,
        month: 30,
        'half-year': 180,
        year: 365,
      };

      const days = retentionPeriods[retentionPeriod] || 180;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      console.log(`🧹 Очистка данных майнеров старше ${days} дней для пользователя: ${userId}`);

      const result = await Miner.destroy({
        where: {
          userId,
          recordedAt: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      console.log(`  ✅ Удалено ${result} старых записей майнеров`);
      return result;
    } catch (error) {
      console.error('❌ Ошибка при очистке старых данных майнеров:', error);
      throw error;
    }
  }

  /**
   * Получение истории данных майнера
   * @param {number} userId - ID пользователя
   * @param {string} macAddress - MAC адрес майнера (опционально)
   * @param {string} ipAddress - IP адрес майнера (опционально)
   * @param {number} limit - ограничение количества записей
   * @returns {Promise<Array>} массив исторических данных
   */
  static async getMinerHistory(userId, macAddress = null, ipAddress = null, limit = 100) {
    try {
      const where = { userId };

      if (macAddress) {
        where.macAddress = macAddress;
      } else if (ipAddress) {
        where.ipAddress = ipAddress;
      }

      const history = await Miner.findAll({
        where,
        order: [['recordedAt', 'DESC']],
        limit,
      });

      return history.map((miner) => miner.get({ plain: true }));
    } catch (error) {
      console.error('❌ Ошибка при получении истории майнера:', error);
      throw error;
    }
  }
}

module.exports = MinerService;
