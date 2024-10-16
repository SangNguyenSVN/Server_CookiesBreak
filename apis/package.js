const express = require('express');
const router = express.Router();
const Package = require('../models/package');

// POST /packages - Tạo gói khám mới
router.post('/', async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo gói khám', error });
  }
});

// GET /packages - Lấy tất cả các gói khám
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy gói khám', error });
  }
});

// GET /packages/:id - Lấy chi tiết gói khám theo ID
router.get('/:id', async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
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
    res.status(200).json({ message: 'Xóa gói khám thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa gói khám', error });
  }
});

module.exports = router;
