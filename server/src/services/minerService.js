const { Miner, User } = require('../../db/models');
const { Op } = require('sequelize');

class MinerService {
  /**
   * Извлекает MAC адрес из данных майнера
   * Проверяет поля mtype.sn, mtype.sern, и другие возможные варианты
   */
  static extractMacAddress(minerData) {
    if (!minerData) return null;

    // Проверяем mtype.sn или mtype.sern
    if (minerData.mtype?.sn) {
      return String(minerData.mtype.sn).trim();
    }
    if (minerData.mtype?.sern) {
      return String(minerData.mtype.sern).trim();
    }

    // Проверяем другие возможные поля
    if (minerData.mac) {
      return String(minerData.mac).trim();
    }
    if (minerData.macAddress) {
      return String(minerData.macAddress).trim();
    }

    return null;
  }

  /**
   * Нормализует IP адрес
   */
  static normalizeIp(ip) {
    if (!ip) return null;
    const ipStr = String(ip).trim();
    return ipStr || null;
  }

  /**
   * Сохраняет данные майнера в БД
   * Создает новую запись (не перезаписывает существующую)
   */
  static async saveMinerData(userId, minerData) {
    try {
      const macAddress = this.extractMacAddress(minerData);
      const ipAddress = this.normalizeIp(minerData.ip);

      if (!macAddress) {
        console.warn('⚠️ Не удалось извлечь MAC адрес из данных майнера:', minerData);
        return null;
      }

      if (!ipAddress) {
        console.warn('⚠️ Не удалось извлечь IP адрес из данных майнера:', minerData);
        return null;
      }

      // Создаем новую запись с временной меткой
      const miner = await Miner.create({
        userId,
        macAddress,
        ipAddress,
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
      });

      console.log(`✅ Данные майнера сохранены: MAC=${macAddress}, IP=${ipAddress}, ID=${miner.id}`);
      return miner;
    } catch (error) {
      console.error('❌ Ошибка при сохранении данных майнера:', error);
      throw error;
    }
  }

  /**
   * Получает последние данные майнеров для пользователя
   * Возвращает последнюю запись для каждого уникального MAC адреса
   */
  static async getLatestMinersData(userId) {
    try {
      // Получаем последние записи для каждого MAC адреса
      const latestMiners = await Miner.findAll({
        where: { userId },
        order: [['recordedAt', 'DESC']],
      });

      // Группируем по MAC адресу и оставляем только последнюю запись для каждого
      const minersMap = new Map();
      for (const miner of latestMiners) {
        const mac = miner.macAddress;
        if (!minersMap.has(mac)) {
          minersMap.set(mac, miner);
        }
      }

      // Преобразуем обратно в формат для API
      const result = Array.from(minersMap.values()).map((miner) => {
        const minerData = miner.get({ plain: true });
        return {
          ip: minerData.ipAddress,
          mac: minerData.macAddress,
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

      return result;
    } catch (error) {
      console.error('❌ Ошибка при получении данных майнеров:', error);
      throw error;
    }
  }

  /**
   * Удаляет старые записи майнеров на основе настройки пользователя
   */
  static async cleanupOldMinerData(userId, retentionPeriod) {
    try {
      const now = new Date();
      let cutoffDate;

      // Вычисляем дату отсечки в зависимости от периода
      switch (retentionPeriod) {
        case 'year':
          cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        case 'half-year':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case '3months':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '1month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        default:
          // По умолчанию полгода
          cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      }

      const deletedCount = await Miner.destroy({
        where: {
          userId,
          recordedAt: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      if (deletedCount > 0) {
        console.log(
          `🧹 Удалено ${deletedCount} старых записей майнеров для пользователя ${userId} (период: ${retentionPeriod})`
        );
      }

      return deletedCount;
    } catch (error) {
      console.error('❌ Ошибка при очистке старых данных майнеров:', error);
      throw error;
    }
  }

  /**
   * Получает исторические данные майнера для построения графиков
   */
  static async getMinerHistory(userId, macAddress, startDate, endDate) {
    try {
      const where = {
        userId,
        macAddress,
      };

      if (startDate || endDate) {
        where.recordedAt = {};
        if (startDate) {
          where.recordedAt[Op.gte] = startDate;
        }
        if (endDate) {
          where.recordedAt[Op.lte] = endDate;
        }
      }

      const history = await Miner.findAll({
        where,
        order: [['recordedAt', 'ASC']],
      });

      return history.map((miner) => miner.get({ plain: true }));
    } catch (error) {
      console.error('❌ Ошибка при получении истории майнера:', error);
      throw error;
    }
  }
}

module.exports = MinerService;

