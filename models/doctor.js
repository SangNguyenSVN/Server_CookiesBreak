// models/doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Sử dụng bcryptjs

const { Schema } = mongoose;

const doctorSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true // Thêm index để truy vấn nhanh hơn
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true, // Bắt buộc
        unique: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);  // Đảm bảo có 10 số (tuỳ thuộc vào định dạng của bạn)
            }
        }
    },
    role: { // Thêm trường role
        type: Schema.Types.ObjectId,
        ref: 'Role', // Liên kết tới Role
        required: true // Bắt buộc
    },
    email: {
        type: String,
        required: false, // Không bắt buộc
        unique: true,
        sparse: true // Thêm sparse để trường email có thể null mà không gây ra lỗi
    },
    specialty: { // Chuyên ngành bác sĩ
        type: String,
        required: false // Không bắt buộc
    },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ', 'Khác'],
        required: false,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    hospital: { // Thêm trường hospital để liên kết với mô hình Hospital
        type: Schema.Types.ObjectId,
        ref: 'Hospital', // Liên kết tới Hospital
        required: true // Bắt buộc
    },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    address: {
        type: String,
        required: false, // Không bắt buộc
    },
    image: { type: String },

}, { timestamps: true });

// Pre-save hook to hash the password before saving
doctorSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10); // Tạo salt với số vòng 10
        this.password = await bcrypt.hash(this.password, salt); // Hash mật khẩu
    }
    next();
});

// Method to compare provided password with stored password
doctorSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password); // So sánh mật khẩu
};

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
