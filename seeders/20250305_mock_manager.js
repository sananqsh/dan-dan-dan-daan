'use strict';

const { User, Treatment, Appointment, Payment } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Insert users
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        phone_number: '09120001220',
        password: await User.hashPassword('123123'),
        role: "manager",
        birth_date: new Date('1984-10-20'),
        national_number: "1234567820",
        created_at: now,
        updated_at: now
      }
    ], { returning: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
