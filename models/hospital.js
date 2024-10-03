const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String },
    phoneNumber: { type: String, required: true },  // Số điện thoại
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
