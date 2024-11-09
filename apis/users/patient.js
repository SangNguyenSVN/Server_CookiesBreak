const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient'); // Import model
const Role = require('../../models/role'); // Đảm bảo import đúng model Role
const authMiddleware = require('../../middleware/auth'); // Import middleware
const bcrypt = require('bcryptjs'); // Thư viện bcrypt để mã hóa mật khẩu
const upload = require('../../config/multer'); // Import multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary

 
router.get('/', authMiddleware, async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
 
// GET /patients/:id - Get a single patient by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select('fullname username phoneNumber email gender image');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
 
// POST /patients - Create a new patient with image upload
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { username, password, ...otherDetails } = req.body;
        console.log(req.body)
        // Kiểm tra xem tên người dùng đã tồn tại chưa
        const existingPatient = await Patient.findOne({ username });
        if (existingPatient) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Kiểm tra vai trò bệnh nhân
        const role = await Role.findOne({ name: 'patient' });
        if (!role) {
            return res.status(400).json({ message: 'Role "patient" does not exist' });
        }

        let imageUrl = '';
        // Tải hình ảnh lên Cloudinary nếu có
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url; // Lưu URL của hình ảnh
        }

        // Tạo mới một bệnh nhân
        const patient = new Patient({
            username,
            password, // Giữ nguyên mật khẩu mà không mã hóa
            image: imageUrl,
            role: role._id,
            ...otherDetails
        });

        await patient.save(); // Lưu bệnh nhân vào cơ sở dữ liệu
        res.status(201).json({ message: 'Patient created successfully', patient });
    } catch (error) {
        console.error(error); // Ghi lại lỗi trong console để theo dõi
        res.status(500).json({ message: error.message });
    }
});

// PUT /patients/:id - Update an existing patient with image upload
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { password, newPassword, ...updateData } = req.body;
        console.log("data update:",req.boy)
        // Tìm bệnh nhân theo ID
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        console.log("Dữ liệu nhận được từ req.body:", req.body);

        // Kiểm tra và cập nhật mật khẩu nếu có
        if (password && newPassword) {
            const isMatch = await patient.comparePassword(password);
            if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
        
            // Cập nhật mật khẩu mới và mã hóa nó
            patient.password = newPassword; // Gán mật khẩu mới sau khi mã hóa
        }

        // Nếu có hình ảnh, thêm vào FormData
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
        }

        // Cập nhật thông tin khác
        Object.assign(patient, updateData);

        await patient.save(); // Lưu lại các thay đổi
        res.status(200).json({ message: 'Patient updated successfully', patient });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /patients/:id - Delete a patient
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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



router.put('/change-password/:id',authMiddleware, async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        console.log(req.body)
        // Find patient by ID
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Verify current password
        const isMatch = await patient.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        patient.password = newPassword;

        // Save the updated patient record
        await patient.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
});

module.exports = router;
