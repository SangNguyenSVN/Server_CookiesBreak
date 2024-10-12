const multer = require('multer');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images'); // Thư mục lưu trữ
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${Date.now()}-${file.originalname}`); // Tên file
    }
});

// Tạo middleware multer
const upload = multer({ storage });

// Xuất middleware
module.exports = upload;
