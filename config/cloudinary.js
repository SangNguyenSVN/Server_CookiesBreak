// config/cloudinary.js
require('dotenv').config(); // Gọi dotenv

const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary với thông tin từ biến môi trường
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ biến môi trường
    api_key: process.env.CLOUDINARY_API_KEY,       // Lấy từ biến môi trường
    api_secret: process.env.CLOUDINARY_API_SECRET   // Lấy từ biến môi trường
});

module.exports = cloudinary;
