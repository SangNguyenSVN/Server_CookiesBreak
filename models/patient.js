const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },  // Giới tính
    dateOfBirth: { type: Date, required: true },  // Ngày sinh
    phoneNumber: { type: String, required: true }, // Số điện thoại
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],  // Liên kết với lịch hẹn
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
