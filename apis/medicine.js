const express = require('express');
const Medicine = require('../models/medicine');
const Category = require('../models/category');
const Hospital = require('../models/hospital'); // Nhập mô hình Hospital
const router = express.Router();

// Tạo một loại thuốc mới
router.post('/', async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        
        // Sử dụng populate để lấy thông tin của category và status
        const populatedMedicine = await Medicine.findById(medicine._id)
            .populate('category')
            .populate('status'); // Cập nhật cho trường status

        res.status(201).json(populatedMedicine);
        await Category.findByIdAndUpdate(medicine.category, { $addToSet: { medicines: medicine._id } });

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
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });

        // Cập nhật liên kết trong Category và Hospital nếu cần
        if (req.body.category) {
            await Category.updateMany(
                { medicines: medicine._id },
                { $pull: { medicines: medicine._id } }
            ); // Xóa thuốc khỏi danh sách của category cũ

            await Category.findByIdAndUpdate(req.body.category, { $addToSet: { medicines: medicine._id } }); // Thêm thuốc vào danh sách của category mới
        }

        res.json(medicine);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Xóa một loại thuốc theo ID
router.delete('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
        
        // Cập nhật Category để xóa liên kết với thuốc này
        await Category.updateMany(
            { medicines: medicine._id },
            { $pull: { medicines: medicine._id } }
        );

        // Cập nhật Hospital nếu cần (nếu cần lưu danh sách thuốc trong Hospital)
        await Hospital.updateMany(
            { medicines: medicine._id },
            { $pull: { medicines: medicine._id } }
        );

        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tìm kiếm thuốc theo tên danh mục
router.get('/search/category', async (req, res) => {
    const { categoryName } = req.query;

    try {
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const medicines = await Medicine.find({ category: category._id }).populate('category');
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Tìm kiếm thuốc theo giá
router.get('/search/price', async (req, res) => {
    const { price } = req.query;

    try {
        const medicines = await Medicine.find({ price: { $lte: Number(price) } }).populate('category');
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sắp xếp thuốc theo giá
router.get('/sort/price', async (req, res) => {
    const { order } = req.query;

    try {
        let sortOptions = {};
        
        if (order === 'asc') {
            sortOptions.price = 1;
        } else if (order === 'desc') {
            sortOptions.price = -1;
        } else {
            return res.status(400).json({ error: 'Invalid sort order. Use "asc" or "desc".' });
        }

        const medicines = await Medicine.find().populate('category').sort(sortOptions);
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
