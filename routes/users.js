const express = require('express');
const { User, Appointment, Treatment } = require('../models');
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
        role: ['manager', 'receptionist']
      },
      attributes: { exclude: ['password'] }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dentists - Managers and receptionists can see dentists
router.get('/dentists', requireStaff, async (req, res) => {
  try {
    const dentists = await User.findAll({
      where: { role: 'dentist' },
      attributes: { exclude: ['password'] }
    });
    res.json(dentists);
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
    const request_user_role = req.user.role;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!hasPermissionToEditRole(request_user_role, user.role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action'})
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/:id/record - Get user record by ID (their appointments)
router.get('/:id/record', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // First get the user to check their role
    const userBasic = await User.findByPk(id);
    if (!userBasic) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userBasic.role != 'dentist' && userBasice.role != 'patient') {
      return res.status(400).json({ error: 'Requested user should be either a dentist or a patient'})
    }

    // Determine which appointments to include based on user role
    const includeOptions = [];
    if (userBasic.role === 'patient') {
      includeOptions.push({
        model: Appointment,
        as: 'PatientAppointments',
        include: [{ model: Treatment }]
      });
    } else if (userBasic.role === 'dentist') {
      includeOptions.push({
        model: Appointment,
        as: 'DentistAppointments',
        include: [{ model: Treatment }]
      });
    }

    // Get user with appropriate appointments
    const user = await User.findByPk(id, {
      include: includeOptions
    });

    // Extract appointments based on role
    const appointments = userBasic.role === 'patient'
      ? user.PatientAppointments
      : user.DentistAppointments;

    res.json({
      user: userBasic,
      appointments: appointments || []
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', requireStaff, async (req, res) => {
  try {
    const {
      name,
      phone_number,
      role,
      insurance_number,
      insurance_provider
    } = req.body;
    const request_user_role = req.user.role;

    if (!hasPermissionToEditRole(request_user_role, role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action'})
    }

    // Build user data object
    const userData = { name, phone_number, role };

    // Add insurance fields if user is a patient
    if (role === 'patient') {
      if (insurance_number) userData.insurance_number = insurance_number;
      if (insurance_provider) userData.insurance_provider = insurance_provider;
    }

    const user = await User.create(userData);
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
    const {
      name,
      phone_number,
      role,
      insurance_number,
      insurance_provider
    } = req.body;
    const request_user_role = req.user.role;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!hasPermissionToEditRole(request_user_role, user.role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action'})
    }

    // Build update data object
    const updateData = { name, phone_number, role };

    // Handle insurance fields based on role
    if (role === 'patient') {
      // If becoming/staying a patient, include insurance fields
      if (insurance_number !== undefined) updateData.insurance_number = insurance_number;
      if (insurance_provider !== undefined) updateData.insurance_provider = insurance_provider;
    } else if (user.role === 'patient' && role !== 'patient') {
      // If changing from patient to another role, clear insurance fields
      updateData.insurance_number = null;
      updateData.insurance_provider = null;
    }

    await user.update({ name, phone_number, role });
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
