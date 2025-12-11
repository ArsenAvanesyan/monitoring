'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'historyRetentionPeriod', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'half-year',
      comment: 'Период хранения истории: year, half-year, 3months, 1month',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'historyRetentionPeriod');
  },
};
