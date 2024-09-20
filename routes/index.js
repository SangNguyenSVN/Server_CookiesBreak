// routes/index.js
const express = require('express');
const router = express.Router();

// Import các route từ thư mục cpanel
const doctorRoutes = require('./cpanel/doctor');
const hospitalRoutes = require('./cpanel/hospital');
const reportRoutes = require('./cpanel/report');
const userRoutes = require('./cpanel/user');

// Định nghĩa các route chính
router.use('/doctors', doctorRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

// Route cho trang chủ (nếu cần)
router.get('/', (req, res) => {
  res.render('index', { title: 'Dashboard' });
});

module.exports = router;
