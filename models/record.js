const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    details: [
        {
            medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
            quantity: { type: Number, required: true }
        }
    ]
}, { timestamps: true });

const Record = mongoose.model('Record', recordSchema);
module.exports = Record;
