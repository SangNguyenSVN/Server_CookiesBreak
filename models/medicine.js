const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },  // Số lượng thuốc
    price: { type: Number, required: true },  // Giá tiền thuốc
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  // Liên kết đến loại thuốc
    description: { type: String },  // Mô tả về thuốc
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
