const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const hospitalSchema = new mongoose.Schema({
  id: { type: ObjectId },
  hospital_name: { type: String, required: true },
  hospital_address: { type: String, required: true },
  hospital_phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\d{3}-\d{3}-\d{4}/.test(v); // Ví dụ: kiểm tra định dạng số điện thoại (xxx-xxx-xxxx)
      },
      message: props => `${props.value} không phải là số điện thoại hợp lệ!`
    }
  }
  // Bạn có thể thêm các trường khác ở đây nếu cần
});

// Đặt tên mô hình với chữ cái đầu tiên viết hoa
module.exports = mongoose.models.hospital || mongoose.model('hospital', hospitalSchema);
