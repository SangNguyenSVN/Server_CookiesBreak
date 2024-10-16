const express = require('express');
const Hospital = require('../models/hospital');
const router = express.Router();

// POST /hospitals - Thêm bệnh viện mới
router.post('/', async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        const savedHospital = await hospital.save();
        res.status(201).json(savedHospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /hospitals - Lấy danh sách tất cả bệnh viện
router.get('/', async (req, res) => {
    try {
        const hospitals = await Hospital.find()
        res.status(200).json(hospitals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /hospitals/:id - Lấy thông tin chi tiết của một bệnh viện
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id).populate('doctors departments medicines packages');
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /hospitals/:id - Cập nhật thông tin bệnh viện
router.put('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
