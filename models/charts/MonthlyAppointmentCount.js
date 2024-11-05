const mongoose = require('mongoose');

const monthlyAppointmentCountSchema = new mongoose.Schema({
    month: { type: String, required: true, unique: true }, // Ví dụ: "2024-10"
    count: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const MonthlyAppointmentCount = mongoose.model('MonthlyAppointmentCount', monthlyAppointmentCountSchema);
module.exports = MonthlyAppointmentCount;
