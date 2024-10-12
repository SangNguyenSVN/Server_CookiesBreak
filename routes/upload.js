const express = require('express');
const uploadAPI = require('../apis/upload');
const uploadCloudinary = require('../apis/uploadCloudinary');

const router = express.Router();

router.use('/', uploadAPI);
router.use('/cloud', uploadCloudinary);


module.exports = router;
