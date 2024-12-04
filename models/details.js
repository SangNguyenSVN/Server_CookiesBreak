const mongoose = require('mongoose');

const MedicineDetailsSchema = new mongoose.Schema({
  medicines: [{  // Mảng các thuốc
    id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Medicine', // Tham chiếu đến model Medicine
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
    }
  }]
}, { timestamps: true });  // Thêm timestamps để theo dõi thời gian tạo và cập nhật

const MedicineDetails = mongoose.model('MedicineDetails', MedicineDetailsSchema);

module.exports = MedicineDetails;
