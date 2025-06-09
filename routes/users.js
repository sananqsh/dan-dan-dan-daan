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
    const { national_number } = req.query;
    if (national_number) {
      const request_user_role = req.user.role;

      const user = await User.findByNationalNumber(national_number);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!hasPermissionToEditRole(request_user_role, user.role)) {
        return res.status(403).json({ error: 'You are not allowed to do this action'})
      }

      res.json(user);
    }

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

    if (userBasic.role != 'patient') {
      return res.status(400).json({ error: 'Requested user should be a patient'})
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
      password,
      role,
      is_active,
      birth_date,
      national_number,
      doctor_notes
    } = req.body;
    const request_user_role = req.user.role;

    if (!hasPermissionToEditRole(request_user_role, role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action'})
    }

    // TODO: if role is doctor or patient, set their national number as their password
    if ((role == "dentist" || role == "patient") && !password) {
      password = national_number
    }

    // Build user data object
    const userData = { name, phone_number, password, role, is_active, birth_date, national_number };

    // Add doctor notes if user is a patient
    if (role === 'patient') {
      if (doctor_notes) userData.doctor_notes = doctor_notes;
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
      first_error = error.errors[0];
      if (first_error) {
        unique_field_name = first_error.path
        return res.status(409).json({ error: unique_field_name + ' already exists', msg: error });
      }
    }

    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone_number,
      password,
      role,
      is_active,
      birth_date,
      national_number,
      doctor_notes
    } = req.body;
    if (password) {
      return res.status(400).json({error: 'Password should be changed only be the change_password API.'});
    }

    const request_user_role = req.user.role;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!hasPermissionToEditRole(request_user_role, user.role)) {
      return res.status(403).json({ error: 'You are not allowed to do this action'})
    }

    // Build update data object
    const updateData = { name, phone_number, role, is_active, birth_date, national_number };

    // Handle doctor notes if user is a patient
    if (role === 'patient') {
      if (doctor_notes !== undefined) updateData.doctor_notes = doctor_notes;
    }

    await user.update(updateData);
    res.json(user);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      first_error = error.errors[0];
      if (first_error) {
        unique_field_name = first_error.path
        return res.status(409).json({ error: unique_field_name + ' already exists', msg: error });
      }
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
