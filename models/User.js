const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
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
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password cannot be empty' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' }
    }
  },
  role: {
    type: DataTypes.ENUM('manager', 'receptionist', 'doctor', 'patient'),
    allowNull: false,
    defaultValue: 'patient',
    validate: {
      isIn: {
        args: [['manager', 'receptionist', 'doctor', 'patient']],
        msg: 'Role must be one of: manager, receptionist, doctor, patient'
      }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: { args: [0], msg: 'Age must be positive' },
      max: { args: [150], msg: 'Age must be realistic' }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  // Patient-specific fields
  //    NOTE: if role-specific fields increased in the future, we should define role-specific tables with foreign key to the users
  insurance_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      isInsuranceNumberValid(value) {
        if (this.role === 'patient' && !value) {
          throw new Error('Insurance number is required for patients');
        }
        if (this.role !== 'patient' && value) {
          throw new Error('Insurance number should only be set for patients');
        }
      }
    }
  },
  insurance_provider: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isInsuranceProviderValid(value) {
        if (this.role !== 'patient' && value) {
          throw new Error('Insurance provider should only be set for patients');
        }
      }
    }
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',

  hooks: {
    beforeCreate: async (user) => {
      // Clean phone number
      if (user.phone_number) {
        user.phone_number = user.phone_number.replace(/[^\d+]/g, '');
      }

      // Hash password
      if (user.password) {
        user.password = await User.hashPassword(user.password);
      }
    },
    beforeUpdate: async (user) => {
      // Clean phone number if it's being changed
      if (user.changed('phone_number')) {
        user.phone_number = user.phone_number.replace(/[^\d+]/g, '');
      }

      // Hash password if it's being changed
      if (user.changed('password')) {
        user.password = await User.hashPassword(user.password);
      }
    }
  }
});


// Class method to hash passwords
User.hashPassword = async function (plainPassword) {
  const saltRounds = 12;
  return await bcrypt.hash(plainPassword, saltRounds);
};


// Instance method to check password
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to generate JWT token
User.prototype.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      userId: this.id,
      role: this.role,
      phone: this.phone_number
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = User;
