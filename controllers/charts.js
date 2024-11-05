const express = require('express');
const MonthlyAppointmentCount = require('../models/charts/MonthlyAppointmentCount'); 
const axios = require('axios'); 
const router = express.Router();

async function saveMonthlyCount() {
    try {
        const today = new Date();
        const monthKey = today.toISOString().slice(0, 7); // Định dạng YYYY-MM

        // Gọi API để lấy số lượng lịch hẹn trong tháng trước
        const response = await axios.get('http://localhost:3001/api/appointments/count-last-month');
        const count = response.data.count; // Lấy số lượng từ phản hồi

        // Kiểm tra xem đã có bản ghi cho tháng này chưa
        const existingRecord = await MonthlyAppointmentCount.findOne({ month: monthKey });

        if (existingRecord) {
            // Cập nhật số lượng nếu đã tồn tại
            existingRecord.count = count;
            await existingRecord.save();
        } else {
            // Tạo bản ghi mới nếu chưa tồn tại
            const newRecord = new MonthlyAppointmentCount({ month: monthKey, count });
            await newRecord.save();
        }
    } catch (error) {
        console.error('Error saving monthly count:', error);
    }
}


module.exports = router; 
