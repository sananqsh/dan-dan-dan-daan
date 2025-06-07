// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Authentication middleware - verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {

    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Specific role middleware functions
const requireManager = requireRole(['manager']);
const requireStaff = requireRole(['manager', 'receptionist']);
const requiredentist = requireRole(['dentist']);
const requirePatient = requireRole(['patient']);

// Permission levels for different operations
const permissions = {
  // User management
  DELETE_USER: ['manager'],
  VIEW_ALL_USERS: ['manager'],
  VIEW_STAFF: ['manager', 'receptionist'],

  // Patient management
  CREATE_PATIENT: ['manager', 'receptionist'],
  UPDATE_PATIENT: ['manager', 'receptionist'],
  DELETE_PATIENT: ['manager'],
  VIEW_PATIENTS: ['manager', 'receptionist'],

  // Appointment management
  CREATE_APPOINTMENT: ['manager', 'receptionist'],
  UPDATE_APPOINTMENT: ['manager', 'receptionist'],
  DELETE_APPOINTMENT: ['manager', 'receptionist'],
  VIEW_APPOINTMENTS: ['manager', 'receptionist'],

  // Financial/Billing (example)
  VIEW_BILLING: ['manager'],
  MANAGE_BILLING: ['manager'],

  // Reports
  VIEW_REPORTS: ['manager'],
  GENERATE_REPORTS: ['manager']
};

// Check specific permission
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = permissions[permission];
    if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions for this operation',
        permission: permission,
        role: req.user.role
      });
    }

    next();
  };
};

const hasPermissionToEditRole = (actorRole, targetRole) => {
    if (actorRole == "manager") {
        return true;
    }

    if (actorRole == "receptionist") {
        if (targetRole == "manager" || targetRole == "receptionist") {
            return false;
        }

        return true;
    }

    return false;
}

module.exports = {
  authenticateToken,
  requireRole,
  requireManager,
  requireStaff,
  requiredentist,
  requirePatient,
  hasPermission,
  hasPermissionToEditRole,
  permissions
};
