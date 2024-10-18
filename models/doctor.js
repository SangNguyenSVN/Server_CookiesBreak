// models/doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const doctorSchema = new mongoose.Schema({
    fullname:{
        type:String,
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
            validator: function(v) {
                return /\d{10}/.test(v);  // Đảm bảo có 10 số (tuỳ thuộc vào định dạng của bạn)
            },
            message: props => `${props.value} is not a valid phone number!`
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
    hospital: { // Thêm trường hospital để liên kết với mô hình Hospital
        type: Schema.Types.ObjectId,
        ref: 'Hospital', // Liên kết tới Hospital
        required: true // Bắt buộc
    },
    imageUrl: { // Thêm trường để lưu URL hình ảnh
        type: String,
        required: false
    },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
doctorSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash mật khẩu với salt là 10
    }
    next();
});

// Method to compare provided password with stored password
doctorSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
