const mongoose = require('mongoose');

// Định nghĩa schema cho Department
const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Trường tên bắt buộc
        unique: true // Đảm bảo tên là duy nhất trong cơ sở dữ liệu
    },
    description: {
        type: String,
        required: false // Mô tả không bắt buộc
    },
    image: { // Trường lưu trữ đường dẫn hình ảnh
        type: String,
        required: true // Bắt buộc có hình ảnh
    },
    hospital: { // Thêm trường để liên kết với bệnh viện
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true // Bắt buộc
    },
}, { timestamps: true }); // Tự động thêm trường createdAt và updatedAt

// Tạo mô hình Department từ schema
const Department = mongoose.model('Department', departmentSchema);

// Xuất mô hình để sử dụng trong các file khác
module.exports = Department;
