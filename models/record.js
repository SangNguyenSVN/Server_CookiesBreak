const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true }],
    description: { type: String },
}, { timestamps: true });

const Record = mongoose.model('Record', recordSchema);
module.exports = Record;
