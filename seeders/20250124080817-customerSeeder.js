"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "customers",
      [
       {
        fullname: 'John Doe',
        company: 'TechCorp',
        address: '123 Tech Street, Silicon Valley',
        phone: '+1-800-555-0199',
        email: 'john.doe@techcorp.com',
        birthday: '1985-05-15',
        product: 'Software Subscription',
        note: 'Premium customer',
        user_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        division_id: 1
      },
      {
        fullname: 'Jane Smith',
        company: 'HealthPlus',
        address: '456 Health Blvd, Wellness City',
        phone: '+1-800-555-0198',
        email: 'jane.smith@healthplus.com',
        birthday: '1990-08-22',
        product: 'Medical Equipment',
        note: 'Frequent buyer',
        user_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        division_id: 1
      },
      {
        fullname: 'Alice Johnson',
        company: 'EduTech',
        address: '789 Knowledge Ave, Learning Hub',
        phone: '+1-800-555-0197',
        email: 'alice.johnson@edutech.com',
        birthday: '1992-02-10',
        product: 'E-learning Subscription',
        note: 'Interested in bulk licensing',
        user_id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        division_id: 2
      },
      {
        fullname: 'Bob Brown',
        company: 'BuildIt Inc.',
        address: '321 Construct Lane, Industry Park',
        phone: '+1-800-555-0196',
        email: 'bob.brown@buildit.com',
        birthday: '1980-11-05',
        product: 'Construction Tools',
        note: 'Requesting demo for new products',
        user_id: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        division_id: 2
      },
      {
        fullname: 'Emma Davis',
        company: 'FashionPro',
        address: '654 Style Street, Designer City',
        phone: '+1-800-555-0195',
        email: 'emma.davis@fashionpro.com',
        birthday: '1988-07-12',
        product: 'Textile Materials',
        note: 'Looking for custom orders',
        user_id: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        division_id: 3
      }
    ], {});
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
