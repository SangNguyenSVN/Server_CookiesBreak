const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({ 
    image: { type: String },
    name: { type: String, required: true, unique: true },
    location: { type: String },
    phoneNumber: { type: String, required: true },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }]
}, { timestamps: true });

// Middleware để xóa bệnh viện và cập nhật liên kết trong các mô hình khác
hospitalSchema.pre('remove', async function(next) {
    const hospitalId = this._id;

    // Cập nhật tất cả bác sĩ để xóa liên kết với bệnh viện này
    await Doctor.updateMany({ hospital: hospitalId }, { $unset: { hospital: "" } });

    // Cập nhật tất cả các phòng để xóa liên kết với bệnh viện này
    await Department.updateMany({ hospital: hospitalId }, { $unset: { hospital: "" } });

    // Cập nhật tất cả các loại thuốc để xóa liên kết với bệnh viện này
    await Medicine.updateMany({ hospital: hospitalId }, { $unset: { hospital: "" } });

    // Cập nhật tất cả các gói để xóa liên kết với bệnh viện này
    await Package.updateMany({ hospital: hospitalId }, { $unset: { hospital: "" } });

    next();
});

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
