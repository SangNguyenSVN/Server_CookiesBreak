const mongoose = require('mongoose');

const MedicineDetailsSchema = new mongoose.Schema({
  medicine: {
    type: String,
    // ref: 'Medicine',  // Tham chiếu đến model Medicine
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const MedicineDetails = mongoose.model('MedicineDetails', MedicineDetailsSchema);

module.exports = MedicineDetails;
