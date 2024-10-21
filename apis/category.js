const express = require('express');
const Medicine = require('../models/medicine');
const Category = require('../models/category');
const router = express.Router();

// Tạo một loại thuốc mới
router.post('/', async (req, res) => {
    try {
        // Nếu có medicine trong request, xử lý thêm
        if (req.body.medicine) {
            const medicine = new Medicine(req.body.medicine);
            await medicine.save();

            // Cập nhật danh mục nếu truyền vào
            await Category.findByIdAndUpdate(medicine.category, { $addToSet: { medicines: medicine._id } });

            res.status(201).json({ category: null, medicine });
        } else {
            // Nếu không có medicine, chỉ tạo Category
            const category = new Category(req.body);
            await category.save();

            res.status(201).json(category);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Lấy tất cả thuốc
router.get('/', async (req, res) => {
    try {
        const medicines = await Medicine.find().populate('category');
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy một loại thuốc theo ID
router.get('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id).populate('category');
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cập nhật một loại thuốc theo ID
router.put('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });

        // Nếu category đã thay đổi, xóa medicine khỏi danh mục cũ
        if (req.body.category && req.body.category !== medicine.category.toString()) {
            await Category.findByIdAndUpdate(medicine.category, { $pull: { medicines: medicine._id } });
            await Category.findByIdAndUpdate(req.body.category, { $addToSet: { medicines: medicine._id } });
        }

        // Cập nhật medicine với dữ liệu mới
        const updatedMedicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.json(updatedMedicine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Xóa một loại thuốc theo ID
router.delete('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });

        // Cập nhật danh mục để xóa ID thuốc khỏi mảng medicines
        await Category.findByIdAndUpdate(medicine.category, { $pull: { medicines: medicine._id } });

        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Các router tìm kiếm và sắp xếp thuốc giữ nguyên

module.exports = router;
