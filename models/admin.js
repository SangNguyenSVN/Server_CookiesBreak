// models/admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const adminSchema = new Schema({
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
    role: { // Thêm trường role
        type: Schema.Types.ObjectId,
        required: true // Bắt buộc
    }
}, { timestamps: true });

// Pre-save hook to hash the password before saving
adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10); // Hash mật khẩu với salt là 10
    }
    next();
});

// Method to compare provided password with stored password
adminSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
