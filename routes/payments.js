const express = require('express');
const { Payment } = require('../models');
const router = express.Router();
const {
  authenticateToken,
  requireStaff,
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/payments - Get all payments
router.get('/', requireStaff, async (req, res) => {
  try {
    const payments = await Payment.findAll({order: [['created_at', 'DESC']]});

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});


// GET /api/payments/:id - Get payment by ID
router.get('/:id', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});


// PUT /api/payments/:id - Update payment
router.put('/:id', requireStaff, async (req, res) => {
  try {
    const { note, ...extraFields } = req.body;
    // NOTE: Only the `note` field is allowed to be changed in the payments
    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({
        error: 'Only the "note" field can be updated',
        invalidFields: Object.keys(extraFields)
      });
    }

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.update({ note });
    res.json(payment);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

module.exports = router;
