// routes/doctor.js
const express = require('express');
const router = express.Router();
const Doctor = require('../../models/doctor'); // Import model
const Role = require('../../models/role'); // Đảm bảo import đúng model Role
const authMiddleware = require('../../middleware/auth'); // Import middleware
const bcrypt = require('bcryptjs'); // Thư viện bcrypt để mã hóa mật khẩu
const upload = require('../../config/multer'); // Import multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary

// GET /doctors - Get all doctors
router.get('/', authMiddleware, async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('role');
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /doctors/:id - Get a single doctor by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('fullname username phoneNumber email specialty gender image');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /doctors - Create a new doctor with image upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { username, password, ...otherDetails } = req.body;

        // Kiểm tra xem tên người dùng đã tồn tại chưa
        const existingDoctor = await Doctor.findOne({ username });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Kiểm tra vai trò bác sĩ
        const role = await Role.findOne({ name: 'doctor' });
        if (!role) {
            return res.status(400).json({ message: 'Role "doctor" does not exist' });
        }

        let imageUrl = '';
        // Tải hình ảnh lên Cloudinary nếu có
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url; // Lưu URL của hình ảnh
        }

        // Tạo mới một bác sĩ
        const doctor = new Doctor({
            username,
            password, // Giữ nguyên mật khẩu mà không mã hóa
            image: imageUrl,
            role: role._id,
            ...otherDetails
        });

        await doctor.save(); // Lưu bác sĩ vào cơ sở dữ liệu
        res.status(201).json({ message: 'Doctor created successfully', doctor });
    } catch (error) {
        console.error(error); // Ghi lại lỗi trong console để theo dõi
        res.status(500).json({ message: error.message });
    }
});

// PUT /doctors/:id - Update an existing doctor with image upload
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { password, newPassword, ...updateData } = req.body;
        // Tìm bác sĩ theo ID
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Kiểm tra và cập nhật mật khẩu nếu có
        if (password && newPassword) {
            const isMatch = await doctor.comparePassword(password);
            if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        
            // Cập nhật mật khẩu mới và mã hóa nó
            const salt = await bcrypt.genSalt(10);
            doctor.password = await bcrypt.hash(newPassword, salt); // Gán mật khẩu mới sau khi mã hóa
        }

        // Nếu có hình ảnh, tải lên Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
        }

        // Cập nhật thông tin khác
        Object.assign(doctor, updateData);

        await doctor.save(); // Lưu lại các thay đổi
        res.status(200).json({ message: 'Doctor updated successfully', doctor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /doctors/:id - Delete a doctor
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật thông tin người dùng
// PUT /doctors/update - Update current user information
router.put('/update', authMiddleware, upload.single('image'), async (req, res) => {
    const userId = req.user.id; // Lấy id người dùng từ token

    // Dữ liệu cần cập nhật
    const { phoneNumber, email, gender, dateOfBirth, fullname, specialty, address } = req.body;
    let uploadedImageUrl = "";

    try {
        // Nếu có tệp hình ảnh, tải lên Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            uploadedImageUrl = result.secure_url; // Lấy URL hình ảnh đã tải lên
        }

        const updateData = {
            phoneNumber,
            email,
            gender,
            dateOfBirth,
            fullname,
            specialty,
            address,
            image: uploadedImageUrl
        };

        // Cập nhật thông tin bác sĩ
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Trả về thông tin bác sĩ đã cập nhật
        res.status(200).json({
            message: 'Doctor information updated successfully',
            user: updatedDoctor
        });
    } catch (error) {
        console.error('Error updating doctor information:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
