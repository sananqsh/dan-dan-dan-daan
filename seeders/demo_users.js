'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert users
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        phone_number: '09120001230',
        age: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Smith',
        phone_number: '09120001231',
        age: 25,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bob Johnson',
        phone_number: '09120001232',
        age: 35,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
