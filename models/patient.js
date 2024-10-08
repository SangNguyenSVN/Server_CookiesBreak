// models/patient.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const patientSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        index: true // Add index for faster queries
    },
    password: { 
        type: String, 
        required: true 
    },
    email: {
        type: String,
        required: false, // Không bắt buộc
        unique: true,
        sparse: true, // Thêm sparse để trường email có thể null mà không gây ra lỗi
        validate: {
            validator: function(v) {
                return /^\S+@\S+\.\S+$/.test(v); // Basic email format validation
            },
            message: props => `${props.value} is not a valid email address!`
        }
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
        type: String,
        enum: ['patient', 'doctor'], // Chỉ cho phép các giá trị này
        default: 'patient' // Mặc định là 'patient'
    },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
patientSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt of 10
    }
    next();
});

// Method to compare provided password with stored password
patientSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
