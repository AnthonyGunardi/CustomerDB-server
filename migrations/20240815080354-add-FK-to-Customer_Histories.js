'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Customer_Histories', 'division_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Divisions',
        key: 'id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
      })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Customer_Histories', 'division_id')
  }
};
