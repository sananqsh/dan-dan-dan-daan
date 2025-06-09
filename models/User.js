const { DataTypes, Op } = require('sequelize');
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
    type: DataTypes.ENUM('manager', 'receptionist', 'dentist', 'patient'),
    allowNull: false,
    defaultValue: 'patient',
    validate: {
      isIn: {
        args: [['manager', 'receptionist', 'dentist', 'patient']],
        msg: 'Role must be one of: manager, receptionist, dentist, patient'
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Birth date cannot be empty' },
      isDate: { msg: 'Must be a valid date' },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Birth date cannot be in the future'
      }
    }
  },
  national_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      notEmpty: { msg: 'National number cannot be empty' },
      is: {
        args: /^\d{5,10}$/,
        msg: 'National number must be 5 to 10 digits'
      }
    }
  },
  // Patient-specific fields
  //   NOTE: if role-specific fields increased in the future,
  //          we should define role-specific tables with foreign key to the users
  doctor_notes: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isDoctorNotesValid(value) {
        if (this.role !== 'patient' && value) {
          throw new Error('Doctor notes should only be set for patients');
        }
      }
    }
  }
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

User.findByNationalNumber = async function (national_number) {
  return await this.findOne({
    where: {
      national_number: { [Op.eq]: national_number }
    }
  });
}

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
