const mongoose = require('mongoose');

// Schema for Evaluation
const evaluationSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    
  },
  comment: {
    type: String,
    required: false,
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
  }
},{ timestamps: true });

// Tạo model từ schema
const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;