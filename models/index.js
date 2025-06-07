const sequelize = require('../config/database');
const User = require('./User');
const Treatment = require('./Treatment');
const Appointment = require('./Appointment');
const Payment = require('./Payment');

// Sync all models (create tables if they don't exist)
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✓ All models synchronized successfully');
  } catch (error) {
    console.error('✗ Error synchronizing models:', error);
  }
}

// Associations
User.hasMany(Appointment, { foreignKey: 'patient_id', as: 'PatientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' });

Treatment.hasMany(Appointment, { foreignKey: 'treatment_id' });
Appointment.belongsTo(Treatment, { foreignKey: 'treatment_id' });

Appointment.hasMany(Payment, { foreignKey: 'appointment_id', as: 'AppointmentPayments' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'Appointment' });

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Treatment,
  Appointment,
  Payment
};
