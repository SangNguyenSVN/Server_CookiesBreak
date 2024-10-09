const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient'); // Import model
const authMiddleware = require('../../middleware/auth'); // Import middleware

// Cập nhật thông tin người dùng
router.put('/update', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Lấy id người dùng từ token

    // Dữ liệu cần cập nhật
    const { phoneNumber, email, gender, dateOfBirth, fullname } = req.body;

    try {
        // Cập nhật thông tin người dùng
        const updatedPatient = await Patient.findByIdAndUpdate(
            userId,
            { phoneNumber, email, gender, dateOfBirth, fullname },
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

module.exports = router;
