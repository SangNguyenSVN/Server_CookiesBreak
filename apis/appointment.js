const express = require('express');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Status = require('../models/status'); // Giả sử mô hình Status đã được khai báo

const router = express.Router();

// Xem tất cả các cuộc hẹn (GET /appointments)
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctor status package'); // Populate để lấy dữ liệu chi tiết từ các bảng liên kết
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
    const { patient, doctor, package, time, date, notes, fullname, email, phoneNumber } = req.body;

    try {
        // Tìm ID của trạng thái "Chờ khám"
        const statusDoc = await Status.findOne({ name: 'chờ khám' });
        const appointmentDate = new Date(date); // Chuyển đổi chuỗi thành Date

        // Kiểm tra định dạng ngày
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ message: 'Định dạng ngày không hợp lệ' });
        }

        if (!statusDoc) {
            return res.status(400).json({ message: 'Trạng thái không tồn tại.' });
        }

        const appointment = new Appointment({
            patient,
            doctor,
            status: statusDoc._id, // Sử dụng ID của trạng thái
            package,
            time,
            date: appointmentDate,
            notes,
            fullname,
            email,
            phoneNumber
        });

        const newAppointment = await appointment.save();

        await Doctor.findByIdAndUpdate(doctor, { $addToSet: { appointments: newAppointment._id } }, { new: true });

        res.status(201).json(newAppointment); // Trả về 201 khi tạo mới thành công
    } catch (err) {
        console.error('Lỗi khi tạo lịch hẹn:', err); // Ghi lại lỗi để kiểm tra
        res.status(400).json({ message: err.message });
    }
});




router.put('/:id', async (req, res) => {
    const { patient, doctor, status, package, date, notes, reason, fullname, email, phoneNumber } = req.body;

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { patient, doctor, status, package, date, notes, reason, fullname, email, phoneNumber },
            { new: true, runValidators: true }
        );

        if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

        // Cập nhật thông tin bác sĩ với ID cuộc hẹn
        await Doctor.findByIdAndUpdate(doctor, { $addToSet: { appointments: updatedAppointment._id } }, { new: true });

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

// Lấy các cuộc hẹn sắp tới trong vòng 24 giờ



module.exports = router;
