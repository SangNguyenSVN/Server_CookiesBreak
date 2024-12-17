const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: String,
  message: String,
  reply: String,
},{ timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
