const express = require('express');
const { User } = require('../models');
const router = express.Router();
const {
  authenticateToken,
  requireManager,
  requireStaff,
  hasPermissionToEditRole,
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);



// GET /api/users - Get all users
router.get('/', requireManager, async (req, res) => {
  try {
    const users = await User.findAll({order: [['created_at', 'DESC']]});

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get staff members - Managers and receptionists can see staff
router.get('/staff', requireStaff, async (req, res) => {
  try {
    const staff = await User.findAll({
      where: {
        role: ['manager', 'receptionist', 'doctor']
      },
      attributes: { exclude: ['password'] }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get patients - Staff can view patients
router.get('/patients', requireStaff, async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient' },
      attributes: { exclude: ['password'] }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    const { request_user_role } = req.user.role;

    if (!hasPermissionToEditRole(request_user_role, user.role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action.'})
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', requireStaff, async (req, res) => {
  try {
    const { name, phone_number, age, role } = req.body;
    const { request_user_role } = req.user.role;

    if (!hasPermissionToEditRole(request_user_role, role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action.'})
    }

    const user = await User.create({ name, phone_number, age, role });
    res.status(201).json(user);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Phone number already exists' });
    }

    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, age, role } = req.body;
    const { request_user_role } = req.user.role;

    const user = await User.findByPk(id);
    if (!hasPermissionToEditRole(request_user_role, user.role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action.'})
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ name, phone_number, age, role });
    res.json(user);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Phone number already exists' });
    }

    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
