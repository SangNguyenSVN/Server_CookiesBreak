// models/patient.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        enum: ['Nam', 'Nữ', 'Khác'], 
        required: false,
        default: null, 
    },
    dateOfBirth: { 
        type: String, 
        required: false 
    },
    fullname: {  // Thêm trường fullname
        type: String,
        required: false, // Không bắt buộc
    },
    address:{
        type: String,
        required: false, // Không bắt buộc
    },
    image: { type: String },

}, { timestamps: true });

// Pre-save hook to hash the password before saving
patientSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10); // Tạo salt với số vòng 10
        this.password = await bcrypt.hash(this.password, salt); // Hash mật khẩu
    }
    next();
});


// Method to compare provided password with stored password
patientSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password); // So sánh mật khẩu
};

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
