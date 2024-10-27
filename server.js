const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const sendReminder = require('./config/reminder'); // Gọi reminder.js

// Gọi routes
const roleRoutes = require('./routes/role');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload'); // Route upload
const userRoutes = require('./routes/user'); // Route upload

const apisRoutes = require('./routes/apis'); // Import routes
const { createPayment } = require('./controllers/paypal');

dotenv.config(); // Tải các biến môi trường từ file .env
const app = express();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected : http://localhost:3001'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Dừng ứng dụng nếu không thể kết nối
    });

// Sử dụng CORS
app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', apisRoutes);
app.use('/api/user', userRoutes);

// paypal
app.post('/create-payment', createPayment);
// Trang chủ
app.get('/', (req, res) => {
    res.send('Welcome to the Admin Panel!');
});

// Cung cấp static file cho hình ảnh
app.use('/images', express.static(path.join(__dirname, 'public/images')));


// Thiết lập cron job để gửi nhắc nhở mỗi ngày vào lúc 
cron.schedule('0 18 * * *', async () => {
    try {
        await sendReminder();
        console.log('Reminders sent successfully.');
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
});
// Xuất ứng dụng
module.exports = app;
