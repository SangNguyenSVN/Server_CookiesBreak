const express = require('express');
const Hospital = require('../models/hospital');
const cloudinary = require('../config/cloudinary'); // Nhập Cloudinary
const upload = require('../config/multer'); // Nhập multer middleware
const router = express.Router();

// POST /hospitals - Thêm bệnh viện mới với hình ảnh
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { file } = req;

        let imageUrl = '';
        if (file) {
            // Upload hình ảnh lên Cloudinary
            const result = await cloudinary.uploader.upload(file.path);
            imageUrl = result.secure_url; // Lấy URL của hình ảnh
        }

        // Tạo đối tượng bệnh viện mới
        const hospitalData = {
            ...req.body,
            image: imageUrl, // Thêm URL hình ảnh vào dữ liệu bệnh viện
        };

        const hospital = new Hospital(hospitalData);
        const savedHospital = await hospital.save();

        // Trả về dữ liệu chi tiết của bệnh viện
        const detailedHospital = await Hospital.findById(savedHospital._id)
            .populate('departments') // Nạp dữ liệu phòng khám nếu cần
            .populate('medicines') // Nạp dữ liệu thuốc nếu cần
            .populate('packages'); // Nạp dữ liệu gói dịch vụ nếu cần

        res.status(201).json(detailedHospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /hospitals - Lấy danh sách tất cả bệnh viện
router.get('/', async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.status(200).json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /hospitals/:id - Lấy thông tin chi tiết của một bệnh viện
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id)
            .populate('doctors departments medicines packages');
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /hospitals/:id - Cập nhật thông tin bệnh viện
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { file } = req;
        const updateData = { ...req.body };

        if (file) {
            // Nếu có file hình ảnh mới, upload lên Cloudinary
            const result = await cloudinary.uploader.upload(file.path);
            updateData.image = result.secure_url; // Cập nhật URL hình ảnh
        }

        const hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
 
// DELETE /hospitals/:id - Xóa một bệnh viện
router.delete('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json({ message: 'Hospital deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
