const mongoose = require('mongoose');

// Schema for Evaluation
const evaluationSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5 
  },
  comment: {
    type: String,
    required: false,
    minlength: 10
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital', 
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', 
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Tạo model từ schema
const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;