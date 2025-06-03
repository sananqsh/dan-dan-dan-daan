'use strict';

const { User, Treatment, Appointment, Payment } = require('../models');

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
        name: 'Kenzo Tenma',
        phone_number: '09120001240',
        password: await User.hashPassword('123456'),
        role: "dentist",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Hannibal Lecter',
        phone_number: '09120001241',
        password: await User.hashPassword('123456'),
        role: "dentist",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bob Dickson',
        phone_number: '09120001250',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        insurance_number: 'INS123456780',
        insurance_provider: 'Red Crescent',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Rick Johnson',
        phone_number: '09120001251',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        insurance_number: 'INS123456781',
        insurance_provider: 'Red Crescent',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Pat Ientson',
        phone_number: '09120001252',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        insurance_number: 'INS123456782',
        insurance_provider: 'Red Crescent',
        created_at: new Date(),
        updated_at: new Date()
      },
    ], { returning: true });

    // Insert treatments
    await queryInterface.bulkInsert('treatments', [
      {
        name: 'Teeth Cleaning',
        description: 'Basic dental cleaning procedure',
        price: 500000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Tooth Extraction',
        description: 'Removal of a decayed or damaged tooth',
        price: 750000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Root Canal',
        description: 'Endodontic treatment for infected tooth pulp',
        price: 1200000,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert appointments
    await queryInterface.bulkInsert('appointments', [
      {
        patient_id: 5,
        dentist_id: 3,
        treatment_id: 1,
        problem_description: 'Plaque buildup',
        locked_price: 500000,
        scheduled_at: new Date('2025-06-01T10:00:00'),
        status: 'done',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        patient_id: 5,
        dentist_id: 3,
        treatment_id: 2,
        problem_description: 'Tooth decay and pain',
        locked_price: 750000,
        scheduled_at: new Date('2025-06-06T11:00:00'),
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        patient_id: 6,
        dentist_id: 4,
        treatment_id: 3,
        problem_description: 'Severe pulp infection',
        locked_price: 1200000,
        scheduled_at: new Date('2025-06-01T10:00:00'),
        status: 'scheduled',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        patient_id: 6,
        dentist_id: 3,
        treatment_id: 3,
        problem_description: 'Severe pulp infection',
        locked_price: 1200000,
        scheduled_at: new Date('2025-06-05T12:00:00'),
        status: 'canceled',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        patient_id: 7,
        dentist_id: 4,
        treatment_id: 1,
        problem_description: 'Pulp infection',
        locked_price: 500000,
        scheduled_at: new Date('2025-06-02T11:00:00'),
        status: 'done',
        created_at: new Date(),
        updated_at: new Date()
      },
    ]);

    // Insert payments
    await queryInterface.bulkInsert('payments', [
      {
        appointment_id: 1,
        amount: 500000,
        note: 'Paid by card',
        paid_at: new Date('2025-06-01T10:30:00'),
        created_at: new Date()
      },
      {
        appointment_id: 5,
        amount: 750000,
        note: 'Paid by insurance',
        paid_at: new Date('2025-06-02T12:00:00'),
        created_at: new Date()
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('treatments', null, {});
    await queryInterface.bulkDelete('appointments', null, {});
    await queryInterface.bulkDelete('payments', null, {});
  }
};
