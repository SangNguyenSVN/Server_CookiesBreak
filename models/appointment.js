const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: false },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    time: { type: String, require: true },
    date: { type: Date, required: true },
    notes: { type: String, require: false, default: '' },
    reason: { type: String, required: false, default: '' }, // Thêm trường reason
    fullname: { type: String, required: true }, // Thêm trường fullname
    email: { type: String, required: true }, // Thêm trường email
    phoneNumber: {
        type: String,
        required: true,
    } 
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
