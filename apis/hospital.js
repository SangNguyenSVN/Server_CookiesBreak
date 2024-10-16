const Hospital = require("../models/hospital");
const express = require('express');
const upload = require('../config/upload'); // Middleware upload (nếu có sử dụng)
const router = express.Router();

// GET /hospitals - Lấy danh sách tất cả bệnh viện
router.get('/', async (req, res) => {
    try {
        const hospitals = await Hospital.find()
            .populate('doctors')
            .populate('departments')
            .populate('medicines')
            .populate('packages');
        res.json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /hospitals/:id - Lấy thông tin chi tiết của một bệnh viện theo ID
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id)
            .populate('doctors')
            .populate('departments')
            .populate('medicines')
            .populate('packages');
        if (!hospital) return res.status(404).json({ message: 'Bệnh viện không tồn tại' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /hospitals - Thêm một bệnh viện mới
router.post('/', async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        const savedHospital = await hospital.save();
        res.status(201).json(savedHospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /hospitals/:id - Cập nhật thông tin bệnh viện theo ID
router.put('/:id', async (req, res) => {
    try {
        const updatedHospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedHospital) return res.status(404).json({ message: 'Bệnh viện không tồn tại' });
        res.json(updatedHospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /hospitals/:id - Xóa bệnh viện theo ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedHospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!deletedHospital) return res.status(404).json({ message: 'Bệnh viện không tồn tại' });
        res.json({ message: 'Đã xóa bệnh viện thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
