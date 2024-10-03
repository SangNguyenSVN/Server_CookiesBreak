const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config(); // Tải các biến môi trường từ file .env
const app = express();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected : http://localhost:3000'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng routes
app.use('/auth', authRoutes);

// Trang chủ
app.get('/', (req, res) => {
    res.send('Welcome to the Admin Panel!');
});

// Xuất ứng dụng
module.exports = app;
