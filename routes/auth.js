const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');

// http://localhost:3000/auth/register/patient
router.post('/register/patient', authController.registerPatient);
// http://localhost:3000/auth/register/doctor
router.post('/register/doctor', authController.registerDoctor);
// http://localhost:3000/auth/login
router.post('/login', authController.login);

module.exports = router;
