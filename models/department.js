const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },  // Liên kết với bệnh viện
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
