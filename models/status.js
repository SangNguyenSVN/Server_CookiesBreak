const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;
