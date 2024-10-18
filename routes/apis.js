const express = require('express');
const departmentAPI = require('../apis/department');
const hospitalAPI = require('../apis/hospital');
const packageAPI = require('../apis/package');
const medicineAPI = require('../apis/medicine')
const categoryAPI = require('../apis/category')
const detailAPI = require('../apis/details')
const statusAPI = require('../apis/status')
const router = express.Router();

// Sử dụng các route API
router.use('/department', departmentAPI);
router.use('/hospital', hospitalAPI);
router.use('/package', packageAPI);
router.use('/medicine', medicineAPI);
router.use('/category', categoryAPI);
router.use('/details', detailAPI);
router.use('/status', statusAPI)


module.exports = router;
