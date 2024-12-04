const express = require('express');
const router = express.Router();
const MedicineDetails = require('../models/details');


router.get('/:id', async (req, res) => {
    try {
        const medicineDetail = await MedicineDetails.findById(req.params.id)
            .populate('medicines.id');  // Populating thông tin thuốc từ model Medicine

        if (!medicineDetail) {
            return res.status(404).send('Chi tiết thuốc không tồn tại');
        }

        res.json(medicineDetail);
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết thuốc:', error);
        res.status(500).send('Lỗi khi truy vấn dữ liệu');
    }
});

router.post('/', async (req, res) => {
    try {
        const { medicines } = req.body; // Dữ liệu gửi từ client (ví dụ: [{ id, quantity }, { id, quantity }])

        // Tạo đối tượng MedicineDetails mới
        const medicineDetail = new MedicineDetails({
            medicines: medicines.map(medicine => ({
                id: medicine.id,
                quantity: medicine.quantity,
            }))
        });

        // Lưu chi tiết thuốc vào cơ sở dữ liệu
        await medicineDetail.save();

        // Trả về chi tiết thuốc đã lưu với thông tin thuốc đầy đủ
        const populatedDetail = await MedicineDetails.findById(medicineDetail._id)
            .populate('medicines.id'); // Populating thông tin thuốc từ model Medicine

        res.status(201).json(populatedDetail); // Trả về chi tiết thuốc đã được populate
    } catch (error) {
        console.error('Lỗi khi thêm chi tiết thuốc:', error);
        res.status(500).send('Lỗi khi thêm chi tiết thuốc');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedDetail = await MedicineDetails.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },  // Cập nhật theo dữ liệu mới từ req.body
            { new: true }         // Trả về đối tượng đã được cập nhật
        ).populate('medicines.id');  // Populating thông tin thuốc từ model Medicine

        if (!updatedDetail) {
            return res.status(404).send('Chi tiết thuốc không tồn tại');
        }

        res.json(updatedDetail);
    } catch (error) {
        console.error('Lỗi khi cập nhật chi tiết thuốc:', error);
        res.status(500).send('Lỗi khi cập nhật dữ liệu');
    }
});
// Xóa chi tiết thuốc
router.delete('/:id', async (req, res) => {
    try {
        const medicineDetails = await MedicineDetails.findByIdAndDelete(req.params.id);
        if (!medicineDetails) return res.status(404).json({ message: 'Medicine details not found' });

        res.status(200).json({ message: 'Medicine details deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
