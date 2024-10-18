const express = require('express');
const router = express.Router();
const Package = require('../models/package');
const Hospital = require('../models/hospital'); // Nhập mô hình Hospital

// POST /packages - Tạo gói khám mới và liên kết với bệnh viện
router.post('/', async (req, res) => {
  try {
    const { hospitalId, ...packageData } = req.body; // Lấy ID bệnh viện từ request body

    // Tạo gói mới
    const newPackage = new Package({
      ...packageData,
      hospital: hospitalId // Liên kết gói với bệnh viện
    });
    
    // Lưu gói mới
    await newPackage.save();

    // Cập nhật bệnh viện để thêm gói vào danh sách
    await Hospital.findByIdAndUpdate(hospitalId, { $push: { packages: newPackage._id } });

    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo gói khám', error });
  }
});

// GET /packages - Lấy tất cả các gói khám
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find().populate('hospital'); // Populate hospital thông tin
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy gói khám', error });
  }
});

// GET /packages/:id - Lấy chi tiết gói khám theo ID
router.get('/:id', async (req, res) => {
  try {
    const package = await Package.findById(req.params.id).populate('hospital'); // Populate hospital thông tin
    if (!package) {
      return res.status(404).json({ message: 'Gói khám không tồn tại' });
    }
    res.status(200).json(package);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy gói khám', error });
  }
});

// PUT /packages/:id - Cập nhật gói khám theo ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPackage) {
      return res.status(404).json({ message: 'Gói khám không tồn tại' });
    }
    res.status(200).json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật gói khám', error });
  }
});

// DELETE /packages/:id - Xóa gói khám theo ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    if (!deletedPackage) {
      return res.status(404).json({ message: 'Gói khám không tồn tại' });
    }

    // Cập nhật bệnh viện để xóa gói khỏi danh sách
    await Hospital.findByIdAndUpdate(deletedPackage.hospital, { $pull: { packages: deletedPackage._id } });

    res.status(200).json({ message: 'Xóa gói khám thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa gói khám', error });
  }
});

module.exports = router;
