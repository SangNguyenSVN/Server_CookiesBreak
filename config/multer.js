const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary'); // Nhập cấu hình Cloudinary

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cookies_break/departments', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Các định dạng cho phép
    // Optionally, you can also specify a transformation or filename
    // public_id: (req, file) => file.filename // Đặt tên tệp (nếu cần)
  },
});

// Tạo middleware upload
const upload = multer({ storage });

// Xuất middleware
module.exports = upload;
