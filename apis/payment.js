const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');

// Tạo mới thanh toán (POST)
router.post('/', async (req, res) => {
    try {
        const { patientId, appointmentId, total, currency, paymentId } = req.body;
        const payment = new Payment({ patientId, appointmentId, total, currency, paymentId });
        await payment.save();
        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy tất cả thanh toán của bệnh nhân (GET - theo patientId)
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        // Tìm các thanh toán có patientId trùng với patient trong appointment
        const payments = await Payment.find()
            .populate({
                path: 'appointmentId', // Lấy thông tin từ model Appointment
                match: { 'patient': patientId }, // So sánh patient trong appointment với patientId từ request
                select: 'patientId total currency' // Chọn các trường cần thiết từ appointment
            });

        // Lọc ra các payment có appointment hợp lệ (dựa vào match)
        const validPayments = payments.filter(payment => payment.appointmentId !== null);

        if (!validPayments || validPayments.length === 0) {
            return res.status(404).json({ message: 'No payments found for this patient.' });
        }

        res.status(200).json(validPayments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Lấy chi tiết thanh toán theo ID (GET - theo paymentId)
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('appointmentId');
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cập nhật thanh toán (PUT)
router.put('/:id', async (req, res) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa thanh toán (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
