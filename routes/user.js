// routes/patientRoutes.js
const express = require('express');
const patientAPI = require('../apis/users/patient'); // Import API
const doctorAPI = require('../apis/users/doctor'); // Import API

const router = express.Router();

// Sử dụng patientAPI cho route /api/patients
router.use('/patients', patientAPI);
router.use('/doctors', doctorAPI);

module.exports = router;
