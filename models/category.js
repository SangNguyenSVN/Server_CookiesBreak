const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }], // Liên kết với Medicine
}, { timestamps: true });
  
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
