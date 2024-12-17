// config/multer.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary'); // Nhập cấu hình Cloudinary

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cookies_break/departments', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Các định dạng cho phép
  },
});

const upload = multer({ storage });

module.exports = upload;
