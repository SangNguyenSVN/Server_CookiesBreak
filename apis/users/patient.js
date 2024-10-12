const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient'); // Import model
const authMiddleware = require('../../middleware/auth'); // Import middleware
const bcrypt = require('bcrypt'); // Thư viện bcrypt để mã hóa mật khẩu

// Cập nhật thông tin người dùng
router.put('/update', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Lấy id người dùng từ token

    // Dữ liệu cần cập nhật
    const { phoneNumber, email, gender, dateOfBirth, fullname, address } = req.body;

    try {
        // Cập nhật thông tin người dùng
        const updatedPatient = await Patient.findByIdAndUpdate(
            userId,
            { phoneNumber, email, gender, dateOfBirth, fullname, address },
            { new: true, runValidators: true } // Trả về bản ghi đã cập nhật và kiểm tra validation
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Trả về thông tin người dùng đã cập nhật
        res.status(200).json({
            message: 'User information updated successfully',
            user: updatedPatient
        });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Thay đổi tài khoản (username và password)
router.put('/account/update', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Lấy id người dùng từ token
    const { username, password } = req.body;

    try {
        // Kiểm tra xem username đã tồn tại chưa
        const existingUser = await Patient.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Nếu có mật khẩu mới, mã hóa mật khẩu
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await Patient.findByIdAndUpdate(userId, { username, password: hashedPassword });
        } else {
            await Patient.findByIdAndUpdate(userId, { username });
        }

        // Trả về thông tin người dùng đã cập nhật
        res.status(200).json({
            message: 'Account information updated successfully',
        });
    } catch (error) {
        console.error('Error updating account information:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
