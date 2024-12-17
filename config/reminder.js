const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const moment = require('moment');
const axios = require('axios'); 
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendReminder = async () => {
    try {
        const response = await axios.get("http://localhost:3001/api/reminder/upcoming");
        const appointments = response.data;

        if (appointments.length === 0) {
            console.log('No upcoming appointments.');
            return;
        }

        for (const appointment of appointments) {
            const now = moment();
            const appointmentDate = moment(appointment.date);
            const appointmentTime = moment(appointment.time.replace('.', ''), 'h:mm A');

            // Kết hợp ngày và giờ cho cuộc hẹn
            appointmentDate.set({
                hour: appointmentTime.hour(),
                minute: appointmentTime.minute(),
                second: 0,
                millisecond: 0,
            });

            const diffHours = appointmentDate.diff(now, 'hours');
            const isTomorrow = now.isSame(appointmentDate.clone().subtract(1, 'days'), 'day');

            let mailOptions;

            // Gửi email nhắc nhở nếu cuộc hẹn nằm trong 24 giờ tới
            if (diffHours <= 24 && diffHours > 0) {
                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: appointment.email,
                    subject: 'Reminder: Upcoming Appointment',
                    text: `Dear ${appointment.fullname},\n\nThis is a reminder for your appointment today at ${appointment.time}.\n\nThank you!`,
                };
            } else if (isTomorrow) {
                mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: appointment.email,
                    subject: 'Reminder: Upcoming Appointment',
                    text: `Dear ${appointment.fullname},\n\nThis is a reminder for your appointment on ${appointment.date} at ${appointment.time}.\n\nThank you!`,
                };
            }

            // Gửi email nếu thỏa mãn điều kiện
            if (mailOptions) {
                try {
                    await transporter.sendMail(mailOptions);
                    console.log('Email sent to:', appointment.email);
                } catch (error) {
                    console.error('Error sending email to:', appointment.email, error);
                }
            } else {
                console.log('No email to send for appointment:', appointment._id);
            }
        }
    } catch (error) {
        console.error('Error retrieving appointments:', error);
    }
};

module.exports = sendReminder;
