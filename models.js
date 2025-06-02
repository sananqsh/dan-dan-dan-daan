// ****************NOTES****************
// Our actors at this phase are only managers and receptionists
// No one should be able to edit payments (*only maybe add notes to them later*)
// *************************************

// ***************IDEAS/OVER-ENGINEERING*****************
// Add reschedulements: appointments would have status, and a nullable rescheduled_from field
//      OR: a reschedulement model that would have a original_appointment_id and a rescheduled_to_appointment_id field

// Add PatientRecord API that returns all appointments

// Add `price_at_the_time` to appointment so that if appointmentCause changed, it'd retain its price
// *************************************

// ****************Abilities****************
// Managers:
// 1. Managers can manage all patients
// 2. Managers can manage all appointments
// 3. Managers can manage all payments
// 4. Managers can manage all dentists
// 5. Managers can manage all receptionists
// 6. Managers can manage all managers
// 7. Managers can manage all appointment causes (and their prices)
// 8. Managers can see all payments

// Receptionists:
// 1. Receptionists can manage all patients
// 2. Receptionists can manage all appointments
// 3. Receptionists can see all appointment causes
// 4. Receptionists can see all dentists
// 5. Receptionists can see all payments

// ********************************************
// **NOT NEEDED**
// Dentists:
// 1. Dentists can see all their patients
// 2. Dentists can see all their appointments
// 3. Dentists can see all their payments
// 4. Dentists can see all appointment causes


// Patients:
// 1. Patients can see their appointments
// 2. Patients can see their payments
// 3. Patients can see their profile
// **NOT NEEDED**
// ********************************************

class Patient {
    constructor(user_id, age, gender, insurance_number) {
        this.user_id = user_id;
        this.age = age;
        this.gender = gender;
        this.insurance_number = insurance_number;
    }
}

class Appointment {
    // status: scheduled, done, canceled
    // if done, there should be a payment!
    constructor(patient_id, dentist_id, appointment_cause_id, scheduled_at, status) {
        this.patient_id = patient_id;
        this.dentist_id = dentist_id;
        this.appointment_cause_id = appointment_cause_id;
        this.scheduled_at = scheduled_at;
        this.status = status;
    }
}

class AppointmentCause {
    constructor(name, description, price) {
        this.name = name;
        this.description = description;
        this.price = price;
    }
}

class Receptionist {
    constructor(user_id) {
        this.user_id = user_id;
    }
}

class Manager {
    constructor(user_id) {
        this.user_id = user_id;
    }
}

class Dentist {
    constructor(user_id, specialization) {
        this.user_id = user_id;
        this.specialization = specialization;
    }
}

class User {
    constructor(first_name, last_name, phone, email, password) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone = phone;
        this.email = email;
        this.password = password;
    }
}

class Payment {
    constructor(appointment_id, amount, paid_at) {
        this.appointment_id = appointment_id;
        this.amount = amount;
        this.paid_at = paid_at;
    }
}

module.exports = Patient;
