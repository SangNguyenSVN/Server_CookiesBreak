// routes/patientRoutes.js
const express = require('express');
const patientAPI = require('../../apis/users/patient'); // Import API

const router = express.Router();

// Sử dụng patientAPI cho route /api/patients
router.use('/patients', patientAPI);

module.exports = router;
