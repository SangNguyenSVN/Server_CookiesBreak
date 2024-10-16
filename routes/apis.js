const express = require('express');
const departmentAPI = require('../apis/department');
const hospitalAPI = require('../apis/hospital');
const packageAPI = require('../apis/package'); // Đã sửa lỗi "reiquire" thành "require"
const router = express.Router();

// Sử dụng các route API
router.use('/department', departmentAPI);
router.use('/hospital', hospitalAPI);
router.use('/package', packageAPI); // Thêm đường dẫn cho gói khám

module.exports = router;
