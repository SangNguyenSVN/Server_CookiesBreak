const express = require('express');
const router = express.Router();
const packageController = require('../apis/package');

// Tạo gói khám mới
router.post('/', packageController.createPackage);

// Lấy tất cả các gói khám
router.get('/', packageController.getAllPackages);

// Lấy gói khám theo ID
router.get('/:id', packageController.getPackageById);

// Cập nhật gói khám
router.put('/:id', packageController.updatePackage);

// Xóa gói khám
router.delete('/:id', packageController.deletePackage);

module.exports = router;
