const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Patient',
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Appointment',
    },
    total: {
        type: Number,
        required: true,
        min: 0, 
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'VND'], 
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    }, 
}, { timestamps: true }); 

paymentSchema.index({ patientId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
