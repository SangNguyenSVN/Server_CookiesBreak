const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packageSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  services: [{
    type: String,
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Tạo timestamps để cập nhật thời gian tự động khi có thay đổi
packageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
