const express = require('express');
const Hospital = require('../models/hospital');
const Package = require('../models/package');
const Medicine = require('../models/medicine');
const Department = require('../models/department')
const cloudinary = require('../config/cloudinary'); // Nhập Cloudinary
const upload = require('../config/multer'); // Nhập multer middleware
const authMiddleware = require('../middleware/auth');
const router = express.Router();
 
// POST /hospitals - Thêm bệnh viện mới với hình ảnh
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { file } = req;

        let imageUrl = '';
        if (file) {
            // Upload the image to Cloudinary
            const result = await cloudinary.uploader.upload(file.path);
            imageUrl = result.secure_url; // Get the image URL
        }

        // Clean up the request body by removing empty strings from arrays
        const cleanArrayFields = (fields) => {
            return fields.map(field => (field === "" ? undefined : field)).filter(field => field !== undefined);
        };

        // Ensure arrays don't contain empty strings and are valid
        const hospitalData = {
            ...req.body,
            doctors: cleanArrayFields(req.body.doctors || []),
            departments: cleanArrayFields(req.body.departments || []),
            medicines: cleanArrayFields(req.body.medicines || []),
            packages: cleanArrayFields(req.body.packages || []),
            image: imageUrl, // Add the image URL to the hospital data
        };

        console.log(hospitalData);  // Debugging line to check the cleaned data

        // Create a new hospital object and save it
        const hospital = new Hospital(hospitalData);
        const savedHospital = await hospital.save();

        // Retrieve and populate the hospital with related data
        const detailedHospital = await Hospital.findById(savedHospital._id)
            .populate('departments') // Populate departments if needed
            .populate('medicines') // Populate medicines if needed
            .populate('packages'); // Populate packages if needed

        // Return the created hospital data
        res.status(201).json(detailedHospital);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(400).json({ message: err.message });
    }
});


// GET /hospitals - Lấy danh sách tất cả bệnh viện
router.get('/', async (req, res) => {
    try {
        const hospitals = await Hospital.find()
            .populate({
                path: 'doctors',
                select: 'image fullname specialty' // Chỉ lấy image, fullname, specialty của bác sĩ
            })
            .populate('departments') // Nếu bạn cũng muốn lấy thông tin phòng ban
            .populate('medicines') // Nếu bạn cũng muốn lấy thông tin thuốc
            .populate('packages') // Nếu bạn cũng muốn lấy thông tin gói
            .exec();

        res.status(200).json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin bệnh viện' });
    }
});

// GET /hospitals/:id - Lấy thông tin chi tiết của một bệnh viện
router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id)
            .populate('doctors departments medicines packages');
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /hospitals/:id - Cập nhật thông tin bệnh viện
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { file } = req; // Giả sử bạn gửi ID gói và thuốc qua req.body
        const updateData = { ...req.body };
        console.log(updateData)
        // Nếu có file hình ảnh mới, upload lên Cloudinary
        if (file) {
            try {
                const result = await cloudinary.uploader.upload(file.path);
                updateData.image = result.secure_url; // Cập nhật URL hình ảnh
            } catch (uploadError) {
                return res.status(400).json({ message: 'Image upload failed: ' + uploadError.message });
            }
        }

        const hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!hospital) {
            return res.status(404).json({ message: 'Bệnh viện không tồn tại' });
        }

        // Cập nhật liên kết cho các bác sĩ
        if (req.body.doctors && Array.isArray(req.body.doctors)) {
            await Doctor.updateMany(
                { _id: { $in: req.body.doctors } },
                { hospital: hospital._id } // Cập nhật liên kết với bệnh viện
            );
        }

        // Cập nhật liên kết cho các phòng
        if (req.body.departments && Array.isArray(req.body.departments)) {
            await Department.updateMany(
                { _id: { $in: req.body.departments } },
                { hospital: hospital._id } // Cập nhật liên kết với bệnh viện
            );
        }

        // Cập nhật liên kết cho thuốc
        if (req.body.medicines && Array.isArray(req.body.medicines)) {
            await Medicine.updateMany(
                { _id: { $in: req.body.medicines } },
                { hospital: hospital._id } // Cập nhật liên kết với bệnh viện
            );
        }
 
        // Cập nhật liên kết cho gói khám
        if (req.body.packages && Array.isArray(req.body.packages)) {
            await Package.updateMany(
                { _id: { $in: req.body.packages } },
                { hospital: hospital._id } // Cập nhật liên kết với bệnh viện
            );
        }

        res.status(200).json(hospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//Get   api/getbyderpartmene
router.get('/derpartment/:departmentName', async (req, res) => {
    const departmentName = req.params.departmentName;

    try {
        // Tìm ID của khoa dựa trên tên khoa
        const department = await Department.findOne({ name: departmentName });

        if (!department) {
            return res.status(404).json({ message: 'Khoa không tồn tại.' });
        }

        // Tìm các bệnh viện liên kết với ID khoa
        const hospitals = await Hospital.find({ departments: department._id })
            .populate('departments'); // Kết hợp dữ liệu từ bảng Department

        if (hospitals.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bệnh viện nào cho khoa này.' });
        }

        res.json(hospitals);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bệnh viện:', error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu.' });
    }
})
// DELETE /hospitals/:id - Xóa một bệnh viện
router.delete('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json({ message: 'Hospital deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
