'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Miners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      macAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'MAC адрес майнера (не уникален, для истории изменений)',
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'IP адрес майнера',
      },
      blink: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Данные о мигании (blink)',
      },
      conf: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Конфигурация майнера (conf)',
      },
      dtype: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Тип устройства',
      },
      mtype: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Тип майнера (mtype) с полями miner_type, sn, sern и др.',
      },
      pools: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Информация о пулах (POOLS)',
      },
      st: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Статус ответа (200, 401, 404 и т.д.)',
      },
      stats: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Статистика майнера (STATS)',
      },
      summ: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Сводная информация (SUMMARY)',
      },
      error: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Ошибка, если есть',
      },
      recordedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Время записи данных',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Создаем индексы для оптимизации запросов
    await queryInterface.addIndex('Miners', ['userId', 'macAddress'], {
      name: 'user_mac_index',
    });
    await queryInterface.addIndex('Miners', ['userId', 'ipAddress'], {
      name: 'user_ip_index',
    });
    await queryInterface.addIndex('Miners', ['recordedAt'], {
      name: 'recorded_at_index',
    });
    await queryInterface.addIndex('Miners', ['userId', 'recordedAt'], {
      name: 'user_recorded_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Miners');
  },
};
