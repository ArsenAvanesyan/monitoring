'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Miner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Miner.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  Miner.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      macAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'MAC адрес майнера (уникальный идентификатор)',
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'IP адрес майнера',
      },
      // Основные поля из JSON
      blink: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Данные о мигании (blink)',
      },
      conf: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Конфигурация майнера (conf)',
      },
      dtype: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Тип устройства',
      },
      mtype: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Тип майнера (mtype) с полями miner_type, sn, sern и др.',
      },
      pools: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Информация о пулах (POOLS)',
      },
      st: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Статус ответа (200, 401, 404 и т.д.)',
      },
      stats: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Статистика майнера (STATS)',
      },
      summ: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Сводная информация (SUMMARY)',
      },
      error: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Ошибка, если есть',
      },
      // Временная метка записи
      recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Время записи данных',
      },
    },
    {
      sequelize,
      modelName: 'Miner',
      tableName: 'Miners',
      indexes: [
        {
          unique: false,
          fields: ['userId', 'macAddress'],
          name: 'user_mac_index',
        },
        {
          unique: false,
          fields: ['userId', 'ipAddress'],
          name: 'user_ip_index',
        },
        {
          fields: ['recordedAt'],
          name: 'recorded_at_index',
        },
        {
          fields: ['userId', 'recordedAt'],
          name: 'user_recorded_at_index',
        },
      ],
    }
  );
  return Miner;
};

