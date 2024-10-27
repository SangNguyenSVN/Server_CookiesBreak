// models/admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Sử dụng bcryptjs

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
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10); // Tạo salt với số vòng 10
        this.password = await bcrypt.hash(this.password, salt); // Hash mật khẩu
    }
    next();
});

// Method to compare provided password with stored password
adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password); // So sánh mật khẩu
};
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
