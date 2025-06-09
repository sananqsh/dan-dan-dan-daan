'use strict';

const { User, Treatment, Appointment, Payment } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Insert users
    const users = await queryInterface.bulkInsert('users', [
      {
        name: 'Pam Beesly',
        phone_number: '9120001230',
        password: await User.hashPassword('123123'),
        role: "receptionist",
        birth_date: new Date('1993-03-10'),
        national_number: "1234567830",
        created_at: now,
        updated_at: now
      },
      {
        name: 'Jane Smith',
        phone_number: '9120001231',
        password: await User.hashPassword('123456'),
        role: "receptionist",
        birth_date: new Date('1994-03-11'),
        national_number: "1234567831",
        created_at: now,
        updated_at: now
      },
      {
        name: 'Kenzo Tenma',
        phone_number: '9120001240',
        password: await User.hashPassword('123456'),
        role: "dentist",
        birth_date: new Date('1988-04-10'),
        national_number: "1234567840",
        created_at: now,
        updated_at: now
      },
      {
        name: 'Hannibal Lecter',
        phone_number: '9120001241',
        password: await User.hashPassword('123456'),
        role: "dentist",
        birth_date: new Date('1977-04-11'),
        national_number: "1234567841",
        created_at: now,
        updated_at: now
      },
      {
        name: 'Bob Dickson',
        phone_number: '9120001250',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        birth_date: new Date('1995-04-10'),
        national_number: "1234567850",
        doctor_notes: "should come to the clinic after 3 months",
        created_at: now,
        updated_at: now
      },
      {
        name: 'Rick Johnson',
        phone_number: '9120001251',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        birth_date: new Date('2005-04-11'),
        national_number: "1234567851",
        doctor_notes: "should have another treatment each week",
        created_at: now,
        updated_at: now
      },
      {
        name: 'Pat Ientson',
        phone_number: '9120001252',
        password: await User.hashPassword('123Bob'),
        role: "patient",
        birth_date: new Date('2015-04-12'),
        national_number: "1234567852",
        created_at: now,
        updated_at: now
      },
    ], { returning: true });

    // Insert treatments
    await queryInterface.bulkInsert('treatments', [
      {
        name: "Cleaning",
        price: 125,
        created_at: now,
        updated_at: now
      },
      {
        name: "Filling",
        price: 250,
        created_at: now,
        updated_at: now
      },
      {
        name: "Root",
        price: 1200,
        created_at: now,
        updated_at: now
      },
      {
        name: "Braces",
        price: 5500,
        created_at: now,
        updated_at: now
      },
      {
        name: "Implant",
        price: 3000,
        created_at: now,
        updated_at: now
      },
    ]);

    // Insert appointments
    await queryInterface.bulkInsert('appointments', [
      {
        patient_id: 5,
        dentist: "Dr. Tenma",
        treatment_id: 1,
        problem_description: 'Plaque buildup',
        locked_price: 125,
        scheduled_at: new Date('2025-06-01T10:00:00'),
        status: 'completed',
        created_at: now,
        updated_at: now
      },
      {
        patient_id: 5,
        dentist: "Dr. Tenma",
        treatment_id: 2,
        problem_description: 'Tooth decay and pain',
        locked_price: 250,
        scheduled_at: new Date('2025-06-06T11:00:00'),
        status: 'confirmed',
        created_at: now,
        updated_at: now
      },
      {
        patient_id: 6,
        dentist: "Dr. Lecter",
        treatment_id: 3,
        problem_description: 'Severe pulp infection',
        locked_price: 1200,
        scheduled_at: new Date('2025-06-01T10:00:00'),
        status: 'confirmed',
        created_at: now,
        updated_at: now
      },
      {
        patient_id: 6,
        dentist: "Dr. Tenma",
        treatment_id: 3,
        problem_description: 'Severe pulp infection',
        locked_price: 1200,
        scheduled_at: new Date('2025-06-05T12:00:00'),
        status: 'canceled',
        created_at: now,
        updated_at: now
      },
      {
        patient_id: 7,
        dentist: "Dr. Lecter",
        treatment_id: 1,
        problem_description: 'Pulp infection',
        locked_price: 125,
        scheduled_at: new Date('2025-06-02T11:00:00'),
        status: 'completed',
        created_at: now,
        updated_at: now
      },
    ]);

    // Insert payments
    await queryInterface.bulkInsert('payments', [
      {
        appointment_id: 1,
        amount: 125,
        note: 'Paid by card',
        paid_at: new Date('2025-06-01T10:30:00'),
        created_at: now
      },
      {
        appointment_id: 5,
        amount: 125,
        note: 'Paid by insurance',
        paid_at: new Date('2025-06-02T12:00:00'),
        created_at: now
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
