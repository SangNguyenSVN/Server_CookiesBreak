const express = require('express');
const departmentAPI = require('../apis/department');
const hospitalAPI = require('../apis/hospital');
const packageAPI = require('../apis/package');
const medicineAPI = require('../apis/medicine')
const categoryAPI = require('../apis/category')
const detailAPI = require('../apis/details')
const statusAPI = require('../apis/status')
const newsAPI = require('../apis/news');
const apmAPI = require('../apis/appointment')
const router = express.Router();

// Sử dụng các route API
router.use('/departments', departmentAPI);

router.use('/hospitals', hospitalAPI);

router.use('/packages', packageAPI);

router.use('/medicines', medicineAPI);

router.use('/categories', categoryAPI);

router.use('/details', detailAPI);

router.use('/status', statusAPI);

router.use('/appoitments', apmAPI);

router.use('/news', newsAPI);


module.exports = router;
