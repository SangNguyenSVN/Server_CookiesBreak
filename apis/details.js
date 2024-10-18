const express = require('express');
const router = express.Router();
const MedicineDetails = require('../models/details');
const Medicine = require('../models/medicine');

// Thêm chi tiết cho một loại thuốc
router.post('/add', async (req, res) => {
    try {
      const { medicine, price, quantity } = req.body;
  
      // Lưu thông tin chi tiết thuốc với medicine là chuỗi
      const newMedicineDetails = new MedicineDetails({
        medicine,  // Đây là một chuỗi thay vì ObjectId
        price,
        quantity
      });
  
      await newMedicineDetails.save();
      res.status(201).json(newMedicineDetails);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
router.get('/', async (req, res) => {
    try {
        const medicineDetails = await MedicineDetails.find().populate('medicine');
        res.status(200).json(medicineDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Sửa chi tiết thuốc
router.put('/:id', async (req, res) => {
    try {
        const { price, quantity } = req.body;

        const updatedMedicineDetails = await MedicineDetails.findByIdAndUpdate(
            req.params.id,
            { price, quantity },
            { new: true }
        );

        if (!updatedMedicineDetails) return res.status(404).json({ message: 'Medicine details not found' });
        res.status(200).json(updatedMedicineDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
