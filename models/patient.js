// models/patient.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose; // Thêm dòng này

const patientSchema = new mongoose.Schema({
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
    // Các trường khác không bắt buộc
    email: {
        type: String,
        required: false, // Không bắt buộc
        unique: true,
        sparse: true // Thêm sparse để trường email có thể null mà không gây ra lỗi
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other'], 
        required: false, // Không bắt buộc
        default: 'Other' 
    },
    dateOfBirth: { 
        type: Date, 
        required: false // Không bắt buộc
    },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
patientSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash mật khẩu với salt là 10
    }
    next();
});

// Method to compare provided password with stored password
patientSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
