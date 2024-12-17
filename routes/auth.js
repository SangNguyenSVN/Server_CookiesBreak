const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// http://localhost:3000/auth/user
router.get('/user/:id', authController.getUser);
// http://localhost:3000/auth/register/patient
router.post('/register/patient', authController.registerPatient);
// http://localhost:3000/auth/register/doctor
router.post('/register/doctor', authController.registerDoctor);
// http://localhost:3000/auth/register/doctor
router.post('/register/admin', authController.registerAdmin);
// http://localhost:3000/auth/login
router.post('/login', authController.login);
router.post('/login/admin', authController.loginAdmin);

router.post('/logout', authMiddleware, authController.logout); // Route đăng xuất

router.put('/change/password', authMiddleware, authController.updateUser);

module.exports = router;
