'use strict';

const { User } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert users
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        phone_number: '09120001230',
        password: await User.hashPassword('123123'),
        role: "manager",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Smith',
        phone_number: '09120001231',
        password: await User.hashPassword('123456'),
        role: "receptionist",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bob Johnson',
        phone_number: '09120001232',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        insurance_number: 'INS123456789',
        insurance_provider: 'Red Crescent',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
