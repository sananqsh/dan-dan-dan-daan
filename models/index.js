const sequelize = require('../config/database');
const User = require('./User');

// Sync all models (create tables if they don't exist)
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✓ All models synchronized successfully');
  } catch (error) {
    console.error('✗ Error synchronizing models:', error);
  }
}

module.exports = {
  sequelize,
  User,
  syncDatabase
};
