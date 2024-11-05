const express = require('express');
const Appointment = require('../models/appointment');
const moment = require('moment');

const router = express.Router();

router.get('/upcoming', async (req, res) => {
    try {
        const now = new Date(); // Thời điểm hiện tại
        const twentyFourHoursLater = new Date(now);
        twentyFourHoursLater.setHours(now.getHours() + 24); // Tính thời điểm 24 giờ tới

        // Tìm tất cả cuộc hẹn có status.name là "chờ khám"
        const appointments = await Appointment.find()
            .populate('status') // Lấy dữ liệu populate
            .exec();

        // Lọc các cuộc hẹn có status.name là "chờ khám"
        const upcomingAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date); // Chuyển đổi date sang Date object
            const appointmentTime = moment(appointment.time, 'h:mm A'); // Chuyển đổi time thành đối tượng moment

            // Kết hợp date và time
            const fullAppointmentTime = new Date(
                appointmentDate.getFullYear(),
                appointmentDate.getMonth(),
                appointmentDate.getDate(),
                appointmentTime.hour(),
                appointmentTime.minute(),
                0, // seconds
                0  // milliseconds
            );

            // Kiểm tra xem cuộc hẹn có nằm trong khoảng thời gian 24 giờ tới không
            return fullAppointmentTime >= now && fullAppointmentTime < twentyFourHoursLater && appointment.status.name === 'chờ khám';
        });

        if (upcomingAppointments.length === 0) {
            return res.status(404).json({ message: 'No upcoming appointments found' });
        }

        res.json(upcomingAppointments); // Trả về danh sách cuộc hẹn sắp tới
    } catch (err) {
        console.error('Error fetching upcoming appointments:', err); // Log lỗi
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
