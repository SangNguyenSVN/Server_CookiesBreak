const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true },
    appointmentDate: { type: Date, required: true },
    notes: { type: String },
    reason: { type: String, required: true }  // Thêm trường reason
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
