const express = require('express');
const Department = require('../models/department');
const upload = require('../config/upload'); // Gọi middleware upload
const router = express.Router();

router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const { file } = req;

        // Kiểm tra xem file đã được upload chưa
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Tạo đường dẫn URL cho hình ảnh
        const image = `http://192.168.1.4:3000/images/${file.filename}`; // Cập nhật đường dẫn nếu cần

        // Tạo mới department
        const newDepartment = new Department({
            name,
            description,
            image, // Lưu URL ảnh vào cơ sở dữ liệu
        });

        await newDepartment.save();
        res.status(201).json(newDepartment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating department', error });
    }
});

module.exports = router;
