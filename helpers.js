const { User } = require('./models');

const validateAppointmentRoles = async (patient_id, dentist_id) => {
    // Validate that patient_id corresponds to a user with 'patient' role
    const patient = await User.findByPk(patient_id);
    if (!patient) {
      return {
        isValid: false,
        statusCode: 404,
        error: 'Patient not found',
        message: `User with ID ${patient_id} does not exist`
      };
    }

    if (patient.role !== 'patient') {
      return {
        isValid: false,
        statusCode: 400,
        error: 'Invalid patient role',
        message: `User with ID ${patient_id} is not a patient, but rather, a ${patient.role})`
      };
    }

    // Validate that dentist_id corresponds to a user with 'dentist' role
    const dentist = await User.findByPk(dentist_id);
    if (!dentist) {
      return {
        isValid: false,
        statusCode: 404,
        error: 'Dentist not found',
        message: `User with ID ${dentist_id} does not exist`
      };
    }

    if (dentist.role !== 'dentist') {
      return {
        isValid: false,
        statusCode: 400,
        error: 'Invalid dentist role',
        message: `User with ID ${dentist_id} is not a dentist, but rather, a ${dentist.role})`
      };
    }

    return { isValid: true };
  };

module.exports = validateAppointmentRoles;
