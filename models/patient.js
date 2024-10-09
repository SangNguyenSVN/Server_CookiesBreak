// models/patient.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const patientSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /\d{10}/.test(v);  // Đảm bảo có 10 số (tuỳ thuộc vào định dạng của bạn)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    role: { 
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other'], 
        required: false,
        default: 'Other' 
    },
    dateOfBirth: { 
        type: Date, 
        required: false 
    },
    fullname: {  // Thêm trường fullname
        type: String,
        required: false, // Không bắt buộc
    },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
patientSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare provided password with stored password
patientSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
