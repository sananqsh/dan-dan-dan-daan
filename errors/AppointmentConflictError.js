class AppointmentConflictError extends Error {
    constructor(message, conflictData) {
        super(message);
        this.name = 'AppointmentConflictError';
        this.conflictData = conflictData;
        this.statusCode = 409; // Conflict status code
    }
}

module.exports = AppointmentConflictError;
