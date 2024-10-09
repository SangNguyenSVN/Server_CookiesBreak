// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role');

// Lấy tất cả vai trò
router.get('/', roleController.getAllRoles);

// Thêm vai trò mới
router.post('/', roleController.addRole);

// Cập nhật vai trò
router.put('/:id', roleController.updateRole);

// Xóa vai trò
router.delete('/:id', roleController.deleteRole);

module.exports = router;
