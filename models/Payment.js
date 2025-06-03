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
  updatedAt: false
});

module.exports = Payment;
