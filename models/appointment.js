const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: false },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' }, // Thêm trường package
    appointmentDate: { type: Date, required: true },
    notes: { type: String },
    reason: { type: String, required: true, default: '' }, // Thêm trường reason
    fullname: { type: String, required: true }, // Thêm trường fullname
    email: { type: String, required: true }, // Thêm trường email
    phoneNumber: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /\d{10}/.test(v);  // Đảm bảo có 10 số (tuỳ thuộc vào định dạng của bạn)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    } // Thêm trường phoneNumber với validation
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
