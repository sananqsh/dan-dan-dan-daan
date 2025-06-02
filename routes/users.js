const express = require('express');
// const User = require('../models/User');
const router = express.Router();

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    // TODO: fetch users from database
    // const users = await User.findAll();
    res.json({ message: 'Users fetched successfully' });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
