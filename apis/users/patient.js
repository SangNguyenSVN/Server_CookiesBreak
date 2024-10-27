const express = require('express');
const router = express.Router();
const Patient = require('../../models/patient'); // Import model
const authMiddleware = require('../../middleware/auth'); // Import middleware
const bcrypt = require('bcryptjs'); // Thư viện bcrypt để mã hóa mật khẩu
const upload = require('../../config/multer'); // Import multer middleware
const cloudinary = require('../../config/cloudinary'); // Nhập Cloudinary


router.get('/', authMiddleware, async (req, res) => {
    try {
        const patients = await Patient.find().select('fullname username phoneNumber email gender image');
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

        // Check if username already exists
        const existingPatient = await Patient.findOne({ username });
        if (existingPatient) return res.status(400).json({ message: 'Username already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let imageUrl = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        const patient = new Patient({
            username,
            password: hashedPassword,
            image: imageUrl,
            ...otherDetails
        });

        await patient.save();
        res.status(201).json({ message: 'Patient created successfully', patient });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /patients/:id - Update an existing patient with image upload
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // Hash the new password if it's being updated
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
        }

        const patient = await Patient.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

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





module.exports = router;
