const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    phoneNumber: { type: String, required: true },  // Số điện thoại
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
