"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
         {
          fullname: "Jose",
          username: "jose",
          password: "12345",
          is_admin: "1",
          is_active: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullname: "Yulia Ningsih",
          username: "Yulia",
          password: "yulia123",
          is_admin: "0",
          is_active: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullname: "Leo Ningsih",
          username: "Leo",
          password: "Leo123",
          is_admin: "0",
          is_active: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullname: "Petrus Ningsih",
          username: "Petrus",
          password: "Petrus123",
          is_admin: "0",
          is_active: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullname: "Botak Ningsih",
          username: "Botak",
          password: "Botak123",
          is_admin: "0",
          is_active: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          fullname: "Budi Ningsih",
          username: "Budi",
          password: "Budi123",
          is_admin: "0",
          is_active: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],

      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
