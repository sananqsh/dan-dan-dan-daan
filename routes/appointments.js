const express = require('express');
const { Op } = require('sequelize');
const { Appointment } = require('../models');
const router = express.Router();
const {
  authenticateToken,
  requireStaff,
} = require('../middleware/auth');
const AppointmentConflictError = require('../errors/AppointmentConflictError');
const validateAppointmentRoles = require('../helpers');

// All routes require authentication
router.use(authenticateToken);


// GET /api/appointments?date=YYYY-MM-DD - Get all appointments (optionally filtered by date)
// GET /api/appointments?from_datetime=ISO8601&to_datetime=ISO8601 - Get all appointments filtered by datetime range
router.get('/', requireStaff, async (req, res) => {
  try {
    const { date, from_datetime, to_datetime } = req.query;
    const where = {};

    if (date) {
      const dayStart = new Date(date + 'T00:00:00');
      const dayEnd = new Date(date + 'T23:59:59.999');
      where.scheduled_at = {
        [Op.between]: [dayStart, dayEnd]
      };
    } else if (from_datetime && to_datetime) {
      // Check if the datetime strings include time components
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyRegex.test(from_datetime) || dateOnlyRegex.test(to_datetime)) {
        return res.status(400).json({
          error: 'Datetime parameters must include time component. Use format YYYY-MM-DDTHH:MM:SS'
        });
      }

      const fromDatetime = new Date(from_datetime);
      const toDatetime = new Date(to_datetime);

      if (isNaN(fromDatetime.getTime()) || isNaN(toDatetime.getTime())) {
        return res.status(400).json({ error: 'Invalid datetime format. Use ISO8601 format.' });
      }

      where.scheduled_at = {
        [Op.between]: [fromDatetime, toDatetime]
      };
    }

    const appointments = await Appointment.findAll({
      where,
      order: [['scheduled_at', 'DESC']]
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/today - Get today's appointments
router.get('/today', requireStaff, async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const where = {
          scheduled_at: {
              [Op.between]: [todayStart, todayEnd]
          }
        };

        const appointments = await Appointment.findAll({
            where,
            order: [['scheduled_at', 'DESC']]
        });

        res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments - Create new appointment
router.post('/', requireStaff, async (req, res) => {
  try {
    const {
        patient_id,
        dentist_id,
        treatment_id,
        problem_description,
        locked_price,
        scheduled_at,
        status
    } = req.body;

    // Validate user roles
    const roleValidation = await validateAppointmentRoles(patient_id, dentist_id);
    if (!roleValidation.isValid) {
      return res.status(roleValidation.statusCode).json({
        error: roleValidation.error,
        message: roleValidation.message
      });
    }

    const appointment = await Appointment.create({
        patient_id: patient_id,
        dentist_id: dentist_id,
        treatment_id: treatment_id,
        problem_description: problem_description,
        locked_price: locked_price,
        scheduled_at: scheduled_at,
        status: status
    });
    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return res.status(error.statusCode).json({
        error: 'Appointment conflict',
        message: error.message,
        details: error.conflictData
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Phone number already exists' });
    }

    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const {
        patient_id,
        dentist_id,
        treatment_id,
        problem_description,
        locked_price,
        scheduled_at,
        status
    } = req.body;

    // Validate user roles
    const roleValidation = await validateAppointmentRoles(patient_id, dentist_id);
    if (!roleValidation.isValid) {
      return res.status(roleValidation.statusCode).json({
        error: roleValidation.error,
        message: roleValidation.message
      });
    }


    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.update({
        patient_id,
        dentist_id,
        treatment_id,
        problem_description,
        locked_price,
        scheduled_at,
        status
    });
    res.json(appointment);
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return res.status(error.statusCode).json({
        error: 'Appointment conflict',
        message: error.message,
        details: error.conflictData
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// POST /api/appointments/:id/cancel - Cancel appointment (instead of delete)
router.post('/:id/cancel', requireStaff, async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
        }

        await appointment.update({status: "canceled"});
        res.json({message: 'Appointment was canceled successfully'});
    } catch (error) {
        console.error('Error canceling appointment:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

module.exports = router;
