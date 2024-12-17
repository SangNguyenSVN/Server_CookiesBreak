const express = require('express');
const router = express.Router();
const upload = require('../config/upload'); // Đường dẫn tới file cấu hình multer

// API upload hình ảnh
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        const { file } = req;
        if (!file) {
            return res.status(400).json({ status: 0, message: 'No file uploaded' });
        } else {
            // Thay đổi địa chỉ IP thành địa chỉ của máy chủ của bạn
            const url = `http://192.168.1.120:3001/images/${file.filename}`; 
            return res.status(200).json({ status: 1, url: url });
        }
    } catch (error) {
        console.error("Upload image error: ", error);
        return res.status(500).json({ status: 0, message: "Server error" });
    }
});
router.post('/images', upload.array('images', 10), async (req, res) => { // 10 là số lượng tối đa hình ảnh có thể upload
    try {
        const files = req.files; // Lấy danh sách các file đã upload
        if (!files || files.length === 0) {
            return res.status(400).json({ status: 0, message: 'No files uploaded' });
        }

        const urls = files.map(file => `http://192.168.1.4:3000/images/${file.filename}`); // Thay đổi địa chỉ IP
        return res.status(200).json({ status: 1, urls: urls });
    } catch (error) {
        console.error("Upload images error: ", error);
        return res.status(500).json({ status: 0, message: "Server error" });
    }
});
// Xuất router
module.exports = router;
