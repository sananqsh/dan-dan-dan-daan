const express = require('express');
const { Op } = require('sequelize');
const { Appointment } = require('../models');
const router = express.Router();
const {
  authenticateToken,
  requireManager,
  requireStaff,
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);


// GET /api/appointments?date=YYYY-MM-DD - Get all appointments (optionally filtered by date)
router.get('/', requireStaff, async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};

    if (date) {
      const dayStart = new Date(date + 'T00:00:00');
      const dayEnd = new Date(date + 'T23:59:59.999');
      where.scheduled_at = {
        [Op.between]: [dayStart, dayEnd]
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

        where.scheduled_at = {
            [Op.between]: [todayStart, todayEnd]
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

    const appointment = await Appointment.create(
        patient_id,
        dentist_id,
        treatment_id,
        problem_description,
        locked_price,
        scheduled_at,
        status
    );
    res.status(201).json(appointment);
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
