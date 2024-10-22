const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient'); // Import model
const authMiddleware = require('../../middleware/auth'); // Import middleware
const bcrypt = require('bcryptjs'); // Thư viện bcrypt để mã hóa mật khẩu
const upload = require('../../config/multer'); // Import multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary

// Cập nhật thông tin người dùng
// http://localhost:3001/api/user/patients/update
router.put('/update', authMiddleware, upload.single('image'), async (req, res) => {
    const userId = req.user.id; // Lấy id người dùng từ token

    // Dữ liệu cần cập nhật
    const { phoneNumber, email, gender, dateOfBirth, fullname, address } = req.body;
    let uploadedImageUrl = ""; 

    try {
        // Nếu có tệp hình ảnh, tải lên Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            uploadedImageUrl = result.secure_url; // Lấy URL hình ảnh đã tải lên
        }
        console.log('Uploaded file:', req.file);

        const updateData = { 
            phoneNumber, 
            email, 
            gender, 
            dateOfBirth, 
            fullname, 
            address, 
            image: uploadedImageUrl 
        };

        // Cập nhật thông tin người dùng
        const updatedPatient = await Patient.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
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
      