// routes/auth.js
const express = require('express');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/login - Login user (only allow managers and receptionists to log in for now)
router.post('/login', async (req, res) => {
    try {
      const { phone_number, password } = req.body;

      if (!phone_number || !password) {
        return res.status(400).json({
          error: 'Phone number and password are required'
        });
      }

      // Find user by phone number
      const user = await User.findOne({
        where: { phone_number }
      });

      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          error: 'Account is deactivated'
        });
      }

      // Check password
      const isValidPassword = await user.checkPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate token
      const token = user.generateAuthToken();

      // Don't send password in response
      const userResponse = {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login
      };

      res.json({
        message: 'Login successful',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage

    // Optionally, we could maintain a blacklist of tokens
    // or update last_logout timestamp

    res.json({
      message: 'Logout successful. Please remove token from client storage.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResponse = {
      id: req.user.id,
      name: req.user.name,
      phone_number: req.user.phone_number,
      role: req.user.role,
      is_active: req.user.is_active,
      last_login: req.user.last_login,
      created_at: req.user.created_at
    };

    console.log(userResponse);

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    // Verify current password
    const isValidPassword = await req.user.checkPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // Update password (will be hashed automatically)
    await req.user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});


// Currently, the only way to create/register new users is to have them created by managers or receptionists
// POST /api/auth/register - Register new user
// router.post('/register', requireStaff, async (req, res) => {
//   try {
//     const { name, phone_number, password, role } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({
//       where: { phone_number }
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         error: 'User with this phone number already exists'
//       });
//     }

//     // Create new user (password will be hashed automatically)
//     const user = await User.create({
//       name,
//       phone_number,
//       password,
//       role: role || 'patient',
//     });

//     // Generate token
//     const token = user.generateAuthToken();

//     // Don't send password in response
//     const userResponse = {
//       id: user.id,
//       name: user.name,
//       phone_number: user.phone_number,
//       role: user.role,
//       is_active: user.is_active,
//       created_at: user.created_at
//     };

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: userResponse,
//       token
//     });

//   } catch (error) {
//     console.error('Registration error:', error);

//     if (error.name === 'SequelizeValidationError') {
//       const errors = error.errors.map(err => ({
//         field: err.path,
//         message: err.message
//       }));
//       return res.status(400).json({ error: 'Validation failed', details: errors });
//     }

//     res.status(500).json({ error: 'Registration failed' });
//   }
// });

module.exports = router;
