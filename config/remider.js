const mongoose = require('mongoose');
const Appointment = require('../models/appointment'); // Import model Appointment
const nodemailer = require('nodemailer'); // Import nodemailer để gửi email
const moment = require('moment');

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // hoặc dịch vụ email khác
    auth: {
        user: process.env.EMAIL_USER, // Địa chỉ email
        pass: process.env.EMAIL_PASS, // Mật khẩu email
    },
});

// Hàm gửi nhắc nhở
const sendReminder = async () => {
    try {
        const tomorrow = moment().add(1, 'days').startOf('day'); // Ngày mai
        const appointments = await Appointment.find({
            date: { $gte: tomorrow.toDate(), $lt: tomorrow.endOf('day').toDate() } // Chắc chắn sử dụng trường 'date'
        }).populate('patient doctor');

        // Kiểm tra nếu không có cuộc hẹn nào
        if (appointments.length === 0) {
            console.log('No appointments for tomorrow.');
            return;
        }

        // Gửi email nhắc nhở cho mỗi cuộc hẹn
        for (const appointment of appointments) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: appointment.email, // Email của bệnh nhân
                subject: 'Reminder: Upcoming Appointment',
                text: `Dear ${appointment.fullname},\n\nThis is a reminder for your appointment on ${moment(appointment.date).format('LL')}.\n\nThank you!`,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent to:', appointment.email);
            } catch (error) {
                console.error('Error sending email to:', appointment.email, error);
            }
        }
    } catch (error) {
        console.error('Error retrieving appointments:', error);
    }
};

// Xuất hàm gửi nhắc nhở
module.exports = sendReminder;
