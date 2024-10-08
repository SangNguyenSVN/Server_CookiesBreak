// models/doctor.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const doctorSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    password: { 
        type: String, 
        required: true 
    },
    fullname: { 
        type: String, 
        required: false 
    },
    email: { 
        type: String, 
        required: false,
        unique: true,
        validate: {
            validator: function(v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    phoneNumber: {
        type: String,
        required: true, // Bắt buộc
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
        default: 'doctor' // Mặc định là 'doctor'
    },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
doctorSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt of 10
    }
    next();
});

// Method to compare provided password with stored password
doctorSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
