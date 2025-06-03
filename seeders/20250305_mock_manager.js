'use strict';

const { User, Treatment, Appointment, Payment } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert users
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        phone_number: '09120001220',
        password: await User.hashPassword('123123'),
        role: "manager",
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
