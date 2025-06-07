const express = require('express');
const { Treatment } = require('../models');
const router = express.Router();
const {
  authenticateToken,
  requireManager,
  requireStaff,
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);


// GET /api/treatments - Get all treatments
router.get('/', requireStaff, async (req, res) => {
    try {
      const treatments = await Treatment.findAll({order: [['created_at', 'DESC']]});

      res.json(treatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      res.status(500).json({ error: 'Failed to fetch treatments' });
    }
  });


// GET /api/treatments/:id - Get treatment by ID
router.get('/:id', requireStaff, async (req, res) => {
    try {
      const { id } = req.params;
      const treatment = await Treatment.findByPk(id);

      if (!treatment) {
        return res.status(404).json({ error: 'Treatment not found' });
      }

      res.json(treatment);
    } catch (error) {
      console.error('Error fetching treatment:', error);
      res.status(500).json({ error: 'Failed to fetch treatment' });
    }
  });

// POST /api/treatments - Create new treatment
router.post('/', requireManager, async (req, res) => {
  try {
    const {
      name,
      description,
      price
    } = req.body;

    const treatment = await Treatment.create({
      name: name,
      description: description,
      price: price
    });
    res.status(201).json(treatment);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    console.error('Error creating treatment:', error);
    res.status(500).json({ error: 'Failed to create treatment' });
  }
});

// PUT /api/treatments/:id - Update treatment
router.put('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price
    } = req.body;

    const treatment = await Treatment.findByPk(id);
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    await treatment.update({ name, description, price });
    res.json(treatment);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }

    console.error('Error updating treatment:', error);
    res.status(500).json({ error: 'Failed to update treatment' });
  }
});

// DELETE /api/treatments/:id - Delete treatment
router.delete('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;

    const treatment = await Treatment.findByPk(id);
    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    await treatment.destroy();
    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({ error: 'Failed to delete treatment' });
  }
});

module.exports = router;
