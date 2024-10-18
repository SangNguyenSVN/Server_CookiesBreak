const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },  // Số lượng thuốc nhập về
    price: { type: Number, required: true },  // Giá tiền thuốc mặc định
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    
    hospital: [{ // Thêm trường để liên kết với bệnh viện
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true // Bắt buộc
    }],
    
    status: { // Thêm trường để liên kết với trạng thái
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Status',
        required: true // Bắt buộc
    }
}, { timestamps: true }); 

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
