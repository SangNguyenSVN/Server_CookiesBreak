const express = require('express');
const Doctor = require('../../models/doctor');
const upload = require('../../config/multer'); // Nhập multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary
const router = express.Router();

// GET /doctors - Lấy danh sách tất cả bác sĩ
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.find().select('fullname specialty imageUrl');
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
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID bác sĩ từ params
        const updates = req.body; // Lấy dữ liệu cập nhật từ body

        // Nếu có hình ảnh, tải lên Cloudinary
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            updates.imageUrl = result.secure_url; // Lưu URL hình ảnh vào updates
        }

        // Cập nhật thông tin bác sĩ
        const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({
            message: 'Doctor information updated successfully',
            doctor: doctor
        });
    } catch (err) {
        console.error('Error updating doctor information:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
