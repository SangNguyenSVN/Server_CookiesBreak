const express = require('express');
const Appointment = require('../models/appointment'); // Đảm bảo bạn đã khai báo model đúng đường dẫn
const router = express.Router();

// Xem tất cả các cuộc hẹn (GET /appointments)
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient doctor status package'); // Populate để lấy dữ liệu chi tiết từ các bảng liên kết
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Xem chi tiết một cuộc hẹn theo ID (GET /appointments/:id)
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient doctor status package');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Thêm một cuộc hẹn mới (POST /appointments)
router.post('/', async (req, res) => {
    const { patient, doctor, status, package,time, date, notes, reason, fullname, email, phoneNumber } = req.body;

    const appointment = new Appointment({
        patient,
        doctor,
        status,
        package,
        time,
        date, 
        notes,
        reason,
        fullname,
        email,
        phoneNumber
    });

    try {
        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment); // Trả về 201 khi tạo mới thành công
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Sửa một cuộc hẹn (PUT /appointments/:id)
router.put('/:id', async (req, res) => {
    const { patient, doctor, status, package, date, notes, reason, fullname, email, phoneNumber } = req.body;

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { patient, doctor, status, package, date, notes, reason, fullname, email, phoneNumber },
            { new: true, runValidators: true } // Trả về bản ghi đã cập nhật
        );
        if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Xóa một cuộc hẹn (DELETE /appointments/:id)
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tìm kiếm cuộc hẹn theo ID bệnh nhân (GET /appointments/patient/:patientId)
router.get('/patient/:patientId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.patientId })
            .populate('patient doctor status package');
        if (appointments.length === 0) return res.status(404).json({ message: 'No appointments found for this patient' });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tìm kiếm cuộc hẹn theo ID bác sĩ (GET /appointments/doctor/:doctorId)
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.params.doctorId })
            .populate('patient doctor status package');
        if (appointments.length === 0) return res.status(404).json({ message: 'No appointments found for this doctor' });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// http://localhost:3001/api/appointments/reminders
router.get('/reminders', async (req, res) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); 
    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

    try {
        const appointments = await Appointment.find({
            date: { $gte: startOfDay, $lte: endOfDay } // Thay đổi từ appointmentDate thành date
        }).populate('patient doctor package status');
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
