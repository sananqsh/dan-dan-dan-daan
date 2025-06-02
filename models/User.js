const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name cannot be empty' },
      len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
    }
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Phone number cannot be empty' },
      is: {
        args: /^[\+]?[1-9][\d]{0,15}$/,
        msg: 'Must be a valid phone number format'
      }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: { args: [0], msg: 'Age must be positive' },
      max: { args: [150], msg: 'Age must be realistic' }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (user) => {
      // Remove any non-digit characters except + at the beginning
      if (user.phone_number) {
        user.phone_number = user.phone_number.replace(/[^\d+]/g, '');
      }
    },
    beforeUpdate: (user) => {
      // Remove any non-digit characters except + at the beginning
      if (user.phone_number) {
        user.phone_number = user.phone_number.replace(/[^\d+]/g, '');
      }
    }
  }
});

module.exports = User;
