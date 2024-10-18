// models/package.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    hospital: { // Thêm trường để liên kết với bệnh viện
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true // Bắt buộc
    },
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
