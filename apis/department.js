const express = require('express');
const Department = require('../models/department');
const Hospital = require('../models/hospital'); // Nhập mô hình Hospital
const cloudinary = require('../config/cloudinary'); // Nhập Cloudinary
const upload = require('../config/multer'); // Nhập middleware multer
const authMiddleware = require('../middleware/auth'); // Import middleware

const router = express.Router();

// POST /departments/add - Tạo mới department
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, description, hospitalId } = req.body; // Lấy hospitalId từ request
        const { file } = req;

        // Kiểm tra xem file đã được upload chưa
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload hình ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(file.path);
        
        // Tạo mới department
        const newDepartment = new Department({
            name,
            description,
            image: result.secure_url, // Lưu URL ảnh từ Cloudinary
            hospital: hospitalId // Thêm liên kết với bệnh viện
        });

        await newDepartment.save();

        // Cập nhật liên kết trong bệnh viện
        await Hospital.findByIdAndUpdate(hospitalId, { $push: { departments: newDepartment._id } });

        res.status(201).json(newDepartment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating department', error });
    }
});

// GET /departments - Lấy tất cả departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find().populate('hospital'); // Thêm populate nếu có liên kết
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /departments/:id - Lấy một department theo ID
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id).populate('hospital');
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /departments/:id - Cập nhật department theo ID
// PUT /departments/:id - Cập nhật department theo ID
router.put('/:id', upload.single('image'), async (req, res) => {
    console.log('Request body: ', req.body); // Log nội dung body
    console.log('Uploaded file: ', req.file); // Log thông tin về file

    try {
        const { name, description, hospitalId } = req.body; // Lấy thông tin từ body
        const updateData = { name, description, hospital: hospitalId };

        // Nếu có file mới, upload lên Cloudinary và cập nhật URL hình ảnh
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url; // Cập nhật URL hình ảnh mới
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.status(200).json(updatedDepartment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating department', error });
    }
});



// DELETE /departments/:id - Xóa department theo ID
router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found' });

        // Cập nhật liên kết trong bệnh viện
        await Hospital.findByIdAndUpdate(department.hospital, { $pull: { departments: department._id } });

        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
