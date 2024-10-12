// config/upload.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary');

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cookies_break/departments', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Các định dạng cho phép
  },
});

// Tạo middleware upload
const upload = multer({ storage });

module.exports = upload;
