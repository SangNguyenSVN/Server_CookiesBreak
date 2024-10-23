const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
  type: { type: String, enum: ['text', 'image'], required: true }, // Loại section: text hoặc image
  content: { type: String }, // Nội dung của đoạn text, chỉ có khi type = 'text'
  url: { type: String } // URL của ảnh, chỉ có khi type = 'image'
});

const newsSchema = new Schema({
  title: { type: String, required: true },
  sections: [sectionSchema], // Mảng chứa các section (text hoặc image)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
