const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String },
    phoneNumber: { type: String, required: true },  // Số điện thoại
    doctors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: false
        }
    ],
    departments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        }
    ],
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: false
}], // Tham chiếu đến thuốc
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: false
}]  // Tham chiếu đến gói khám
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
