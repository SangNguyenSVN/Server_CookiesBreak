const express = require('express');
const Status = require('../models/status'); // Đảm bảo đường dẫn chính xác
const router = express.Router();

// Tạo một trạng thái mới
router.post('/', async (req, res) => {
    try {
        const status = new Status(req.body);
        await status.save();
        res.status(201).json(status);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Lấy tất cả trạng thái
router.get('/', async (req, res) => {
    try {
        const statuses = await Status.find();
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy một trạng thái theo ID
router.get('/:id', async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);
        if (!status) return res.status(404).json({ error: 'Status not found' });
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cập nhật một trạng thái theo ID
router.put('/:id', async (req, res) => {
    try {
        const status = await Status.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!status) return res.status(404).json({ error: 'Status not found' });
        res.json(status);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Xóa một trạng thái theo ID
router.delete('/:id', async (req, res) => {
    try {
        const status = await Status.findByIdAndDelete(req.params.id);
        if (!status) return res.status(404).json({ error: 'Status not found' });
        res.json({ message: 'Status deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
