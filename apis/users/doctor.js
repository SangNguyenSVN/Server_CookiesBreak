const express = require('express');
const Doctor = require('../../models/doctor');
const upload = require('../../config/multer'); // Nhập multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary
const router = express.Router();
const authMiddleware = require('../../middleware/auth'); // Import middleware


router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select('fullname image specialty hospital') // Include `fullname`, `image`, `specialty`, and `hospital`
            .populate('hospital', 'name'); // Populate `hospital` field with only the `name` (or other specific fields)

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching doctors', details: error.message });
    }
});


router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { fullname, username, password, phoneNumber, role, email, specialty, gender, dateOfBirth, hospital, address } = req.body;

        // Kiểm tra và thêm bệnh viện nếu chưa tồn tại
        let hospitalDoc = await Hospital.findOne({ name: hospital });
        if (!hospitalDoc) {
            return res.status(400).json({ message: 'Invalid hospital ID' });
        }

        // Tải ảnh lên Cloudinary nếu có
        let imageUrl = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        // Tạo mới bác sĩ
        const doctor = new Doctor({
            fullname,
            username,
            password,
            phoneNumber,
            role,
            email,
            specialty,
            gender,
            dateOfBirth,
            hospital: hospitalDoc._id,
            address,
            image: imageUrl
        });

        // Lưu bác sĩ mới vào database
        await doctor.save();

        // Cập nhật danh sách bác sĩ trong bệnh viện
        hospitalDoc.doctors.push(doctor._id); // Thêm ID bác sĩ vào mảng doctors của bệnh viện
        await hospitalDoc.save();

        res.status(201).json(doctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// PUT /doctors/:id - Cập nhật thông tin bác sĩ
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;

        // Find doctor by ID
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Update image if provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            doctor.image = result.secure_url;
        }

        // Update other fields
        Object.assign(doctor, req.body);
        await doctor.save();

        res.status(200).json(doctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /doctors/:id - Xóa bác sĩ
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByIdAndDelete(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor deleted successfully' });
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
