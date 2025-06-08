const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Appointment = require('./Appointment');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Appointment,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  note: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  hooks: {
    beforeUpdate: (payment, options) => {
      // Get the changed fields
      const changedFields = payment.changed();

      // Check if any field other than 'note' is being updated
      const invalidUpdates = changedFields.filter(field => field !== 'note');

      if (invalidUpdates.length > 0) {
        throw new Error(`Only the 'note' field can be updated. Attempted to update: ${invalidUpdates.join(', ')}`);
      }
    }
  }
});


Payment.getSummary = async function() {
  const paymentSummary = await this.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'sessions'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalPayment']
    ],
    raw: true
  });

  const result = paymentSummary[0];

  return {
    sessions: parseInt(result.sessions) || 0,
    totalPayment: parseFloat(result.totalPayment) || 0.00
  };
};

Payment.createFromAppointment = async function(appointment) {
  const payment = await this.create({
    appointment_id: appointment.id,
    amount: appointment.locked_price,
    paid_at: new Date()
  });

  return { success: true, payment: payment }
}

module.exports = Payment;
