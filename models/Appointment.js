const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Treatment = require('./Treatment');
const AppointmentConflictError = require('../errors/AppointmentConflictError');


const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  dentist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  treatment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Treatment,
      key: 'id'
    }
  },
  problem_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  locked_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    // After being completed, we would demand payment from patient
    type: DataTypes.ENUM('confirmed', 'completed', 'canceled', 'pending'),
    defaultValue: 'confirmed',
    allowNull: false
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (appointment, options) => {
      await validateNoConflicts(appointment);
    },
    beforeUpdate: async (appointment, options) => {
      if (appointment.changed('scheduled_at') || appointment.changed('dentist_id') || appointment.changed('patient_id')) {
        await validateNoConflicts(appointment);
      }
    },
    afterUpdate: async (appointment, options) => {
      if (appointment.changed('status') && appointment.status == 'completed') {
        await makePaymentRecord(appointment);
      }
    }
  }
});


async function makePaymentRecord(appointment) {
  const Payment = require('./Payment');
  await Payment.createFromAppointment(appointment);
}

async function validateNoConflicts(appointment) {
  // Find conflicting appointment with same scheduled_at and same dentist or patient
  const conflict = await Appointment.findOne({
      where: {
      scheduled_at: appointment.scheduled_at,
      status: 'confirmed',
      id: { [Op.ne]: appointment.id || null },
      [Op.or]: [
          { dentist_id: appointment.dentist_id },
          { patient_id: appointment.patient_id }
      ]
      }
  });

  if (conflict) {
      const isDentistConflict = conflict.dentist_id === appointment.dentist_id;
      const isPatientConflict = conflict.patient_id === appointment.patient_id;

      let message = `Conflict detected with appointment ID ${conflict.id}.`;
      if (isDentistConflict && isPatientConflict) {
        message += ` Both patient and dentist have appointments at that time.`;
      } else if (isDentistConflict) {
        message += ` Dentist is already scheduled at that time.`;
      } else if (isPatientConflict) {
        message += ` Patient is already scheduled at that time.`;
      }

      throw new AppointmentConflictError(message, {
        conflictId: conflict.id,
        isDentistConflict,
        isPatientConflict,
        scheduledAt: conflict.scheduled_at
    });
  }
}

module.exports = Appointment;
