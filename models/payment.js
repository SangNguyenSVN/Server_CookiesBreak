const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Patient',
    },
    total: {
        type: Number,
        required: true,
        min: 0, // Số tiền phải lớn hơn hoặc bằng 0
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'VND'], // Chỉ cho phép các loại tiền tệ này
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'failed'],
        default: 'pending',
    },
    paymentId: {
        type: String,
        required: true,
    }, 
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

paymentSchema.index({ patientId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
