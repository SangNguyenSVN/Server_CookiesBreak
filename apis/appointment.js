const express = require('express');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Status = require('../models/status'); // Giả sử mô hình Status đã được khai báo
const authMiddleware = require('../middleware/auth');
// const authMiddleware = require('../middleware/auth'); // Import middleware

const router = express.Router();

// Xem tất cả các cuộc hẹn (GET /appointments)
// router.get('/', async (req, res) => {
//     try {
//         const appointments = await Appointment.find()
//             .populate('doctor status package'); // Populate để lấy dữ liệu chi tiết từ các bảng liên kết
//         res.json(appointments);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

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

// Tìm kiếm cuộc hẹn theo ID bác sĩ (GET /appointments/doctor/:doctorId)
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        // Tìm tất cả cuộc hẹn cho bác sĩ theo ID, loại trừ những cuộc hẹn có trạng thái "đã thanh toán"
        const appointments = await Appointment.find({
            doctor: req.params.doctorId
        })
            .populate('doctor status package')
            .populate({
                path: 'status',
                match: { name: { $ne: 'đã thanh toán' } }, // Exclude "đã thanh toán" status
            });

        // Lọc ra những cuộc hẹn không có trạng thái null
        const filteredAppointments = appointments.filter(appointment => appointment.status !== null);

        if (filteredAppointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor' });
        }

        res.json(filteredAppointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/count-this-month', async (req, res) => {
    try {
        const today = new Date();

        // Thiết lập ngày bắt đầu của tháng hiện tại
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Ngày hiện tại
        const endOfCurrentMonth = today;

        const count = await Appointment.countDocuments({
            date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        });

        return res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/date-time/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Get tomorrow's date and the date 7 days from today
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate());

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Find appointments for the specified doctor within 1 to 7 days from today
        const appointments = await Appointment.find({
            doctor: doctorId,
            date: { $gte: tomorrow, $lt: nextWeek } // Filter for dates between tomorrow and 7 days from now
        }, 'date time');

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No upcoming appointments found for this doctor within the next 7 days' });
        }

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/by-patient/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const appointments = await Appointment.find({ patient: id }).populate('status doctor package');

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this patient.' });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments by patient ID:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get appointments by email
router.get('/by-email/:email', async (req, res) => {
    try {
        const { email } = req.params;


        const appointments = await Appointment.find({ email }).populate('status doctor package');

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this email.' });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments by email:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/appointments/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Find all appointments for the doctor, excluding those with status name 'chờ khám'
        const appointments = await Appointment.find({
            doctor: doctorId,
            'status.name': { $ne: 'Chờ khám' }, // Filter out appointments with 'chờ khám' status
        })
            .populate('patient') // Populate patient data (optional)
            .populate('doctor') // Populate doctor data (optional)
            .populate('status') // Populate status data (optional)
            .populate('package'); // Populate package data (optional)

        // Return the appointments
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient doctor status package') // Populate related fields if needed
            .sort({ date: -1, time: -1 }); // Sort by date and time in descending order

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
});

router.get('/next-7-days', async (req, res) => {
    try {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7); // Set the date to 7 days from today

        const appointments = await Appointment.find({
            date: { $gte: today, $lte: nextWeek }
        })
            .populate('patient doctor status package') // Populate related fields if needed
            .sort({ date: 1, time: 1 }); // Sort by date and time in ascending order

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming appointments', error });
    }
});

router.put('/update-status/:appointmentId', authMiddleware, async (req, res) => {
    const { appointmentId } = req.params; // ID của lịch khám
    const { statusName, reason } = req.body; // Tên trạng thái mới

    try {
        // Tìm status có name bằng `statusName`
        const status = await Status.findOne({ name: statusName });
        if (!status) {
            return res.status(404).json({ message: 'Status không tồn tại.' });
        }

        // Cập nhật status cho Appointment
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { 
                status: status._id,
                reason: reason,
             },
            { new: true } 
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Lịch khám không tồn tại.' });
        }

        res.status(200).json({
            message: 'Cập nhật trạng thái thành công.',
            appointment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
});


router.get('/monthly/:year/:month', async (req, res) => {
    const { year, month } = req.params;
    const currentDate = new Date();
    const currentDay = currentDate.getDate(); // Ngày hiện tại (1-31)
    const currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)

    // Kiểm tra nếu tháng hiện tại là tháng yêu cầu trong API
    if (parseInt(month) > currentMonth || parseInt(year) > currentDate.getFullYear()) {
        return res.status(400).json({ message: 'Tháng yêu cầu không hợp lệ, phải là tháng hiện tại hoặc trước đó.' });
    }

    // Tính ngày bắt đầu của tháng
    const startOfMonth = new Date(`${year}-${month}-01`);
    // Nếu tháng yêu cầu là tháng hiện tại, thì ngày kết thúc là ngày hiện tại
    const endOfMonth = (parseInt(month) === currentMonth) 
        ? new Date(`${year}-${month}-${currentDay}`)
        : new Date(`${year}-${parseInt(month) + 1}-01`);

    try {
        // Lấy tất cả lịch hẹn trong tháng
        const appointments = await Appointment.aggregate([
            {
                $match: {
                    date: {
                        $gte: startOfMonth, // Ngày bắt đầu tháng
                        $lt: endOfMonth // Ngày kết thúc (ngày hiện tại hoặc ngày đầu tháng tiếp theo)
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$date" }, // Nhóm theo ngày trong tháng
                    count: { $sum: 1 } // Tính số lượng lịch hẹn trong mỗi ngày
                }
            },
            {
                $sort: { "_id": 1 } // Sắp xếp theo ngày
            }
        ]);

        // Tạo một mảng chứa tất cả các ngày từ 1 đến ngày hiện tại
        let allDaysInMonth = Array.from({ length: currentDay }, (_, i) => ({ _id: i + 1, count: 0 }));

        // Thêm dữ liệu từ appointments vào mảng allDaysInMonth
        appointments.forEach(appointment => {
            const day = appointment._id - 1;
            allDaysInMonth[day] = appointment; // Cập nhật count cho ngày có lịch hẹn
        });

        res.status(200).json(allDaysInMonth);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error });
    }
});




// Thống kê lịch hẹn theo năm
router.get('/yearly/:year', async (req, res) => {
    const { year } = req.params;

    try {
        const appointments = await Appointment.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(`${year}-01-01`), // Ngày bắt đầu năm
                        $lt: new Date(`${parseInt(year) + 1}-01-01`) // Ngày bắt đầu năm tiếp theo
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" }, // Nhóm theo tháng
                    count: { $sum: 1 } // Tính số lượng lịch hẹn trong mỗi tháng
                }
            },
            {
                $sort: { "_id": 1 } // Sắp xếp theo tháng
            }
        ]);

        // Lấy tháng hiện tại
        const currentMonth = new Date().getMonth() + 1; // Lấy tháng hiện tại (0-11, cộng 1 để có tháng 1-12)

        // Tạo mảng chứa các tháng từ 1 đến tháng hiện tại
        const months = Array.from({ length: currentMonth }, (_, index) => index + 1);

        // Điền thêm các tháng không có lịch hẹn (count = 0)
        const filledAppointments = months.map(month => {
            const monthData = appointments.find(item => item._id === month);
            return {
                _id: month,
                count: monthData ? monthData.count : 0
            };
        });

        res.status(200).json(filledAppointments);
    } catch (error) {
        res.status(500).json({ message: 'Có lỗi xảy ra', error });
    }
});

module.exports = router;
