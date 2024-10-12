const express = require('express');
const departmentAPI = require('../apis/department');

const router = express.Router();

router.use('/', departmentAPI);

module.exports = router;
