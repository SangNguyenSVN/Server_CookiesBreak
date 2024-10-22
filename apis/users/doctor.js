const express = require('express');
const Doctor = require('../../models/doctor');
const upload = require('../../config/multer'); // Nhập multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary
const router = express.Router();
const authMiddleware = require('../../middleware/auth'); // Import middleware



// GET /doctors - Lấy danh sách tất cả bác sĩ
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find().select('fullname specialty image');
        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /doctors/hospital/:hospitalId - Lấy danh sách bác sĩ theo ID bệnh viện
router.get('/hospital/:hospitalId', async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const doctors = await Doctor.find({ hospital: hospitalId }).select('fullname specialty imageUrl');

        if (doctors.length === 0) {
            return res.status(404).json({ message: 'No doctors found for this hospital' });
        }

        res.status(200).json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /doctors/:id - Lấy thông tin bác sĩ theo ID
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('fullname specialty imageUrl');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(doctor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /doctors/:id - Cập nhật thông tin bác sĩ và tải lên hình ảnh
router.put('/update', authMiddleware, upload.single('image'), async (req, res) => {
    const userId = req.user.id; // Lấy id người dùng từ token

    // Dữ liệu cần cập nhật
    const { phoneNumber, email, gender, dateOfBirth, specialty, fullname, address } = req.body;
    let uploadedImageUrl = null; // Khởi tạo với null

    try {
        // Nếu có tệp hình ảnh, tải lên Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            uploadedImageUrl = result.secure_url; // Lấy URL hình ảnh đã tải lên
        }

        // Tạo đối tượng cập nhật với hình ảnh là null nếu không có
        const updateData = {
            phoneNumber,
            email,
            gender,
            dateOfBirth,
            specialty,
            fullname,
            address,
            image: uploadedImageUrl // Gán URL hình ảnh hoặc null
        };

        // Cập nhật thông tin người dùng
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Trả về thông tin người dùng đã cập nhật
        res.status(200).json({
            message: 'User information updated successfully',
            user: updatedDoctor
        });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
