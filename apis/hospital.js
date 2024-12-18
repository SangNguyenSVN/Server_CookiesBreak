const express = require('express');
const Hospital = require('../models/hospital');
const Package = require('../models/package');
const Medicine = require('../models/medicine');
const Department = require('../models/department')
const Doctor = require('../models/doctor')
const cloudinary = require('../config/cloudinary'); // Nh ập Cloudinary
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
router.put('/:id',authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { file } = req;
        const updateData = { ...req.body };

        // Parse các chuỗi JSON thành mảng
        if (typeof updateData.doctors === 'string') {
            updateData.doctors = JSON.parse(updateData.doctors);
        }
        if (typeof updateData.departments === 'string') {
            updateData.departments = JSON.parse(updateData.departments);
        }
        if (typeof updateData.medicines === 'string') {
            updateData.medicines = JSON.parse(updateData.medicines);
        }
        if (typeof updateData.packages === 'string') {
            updateData.packages = JSON.parse(updateData.packages);
        }

        console.log(updateData);

        // Tải ảnh lên Cloudinary nếu có
        if (file) {
            try {
                const result = await cloudinary.uploader.upload(file.path);
                updateData.image = result.secure_url;
            } catch (uploadError) {
                return res.status(400).json({ message: 'Tải lên hình ảnh thất bại: ' + uploadError.message });
            }
        }

        // Cập nhật bệnh viện
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!hospital) {
            return res.status(404).json({ message: 'Bệnh viện không tồn tại' });
        }

        // Kiểm tra và xử lý mảng bác sĩ
        if (Array.isArray(updateData.doctors)) {
            if (updateData.doctors.length === 0) {
                // Nếu mảng bác sĩ rỗng, xóa tất cả liên kết bác sĩ với bệnh viện này
                await Doctor.updateMany(
                    { hospital: hospital._id },
                    { $unset: { hospital: "" } }
                );
            } else {
                // Nếu có bác sĩ, cập nhật liên kết cho các bác sĩ
                await Doctor.updateMany(
                    { _id: { $in: updateData.doctors } },
                    { hospital: hospital._id }
                );
            }
        }

        // Kiểm tra và xử lý mảng phòng ban
        if (Array.isArray(updateData.departments)) {
            if (updateData.departments.length === 0) {
                // Nếu mảng phòng ban rỗng, xóa tất cả liên kết phòng ban với bệnh viện này
                await Department.updateMany(
                    { hospital: hospital._id },
                    { $unset: { hospital: "" } }
                );
            } else {
                // Nếu có phòng ban, cập nhật liên kết cho các phòng ban
                await Department.updateMany(
                    { _id: { $in: updateData.departments } },
                    { hospital: hospital._id }
                );
            }
        }

        // Kiểm tra và xử lý mảng thuốc
        if (Array.isArray(updateData.medicines)) {
            if (updateData.medicines.length === 0) {
                // Nếu mảng thuốc rỗng, xóa tất cả liên kết thuốc với bệnh viện này
                await Medicine.updateMany(
                    { hospital: hospital._id },
                    { $unset: { hospital: "" } }
                );
            } else {
                // Nếu có thuốc, cập nhật liên kết cho các thuốc
                await Medicine.updateMany(
                    { _id: { $in: updateData.medicines } },
                    { hospital: hospital._id }
                );
            }
        }

        // Kiểm tra và xử lý mảng gói dịch vụ
        if (Array.isArray(updateData.packages)) {
            if (updateData.packages.length === 0) {
                // Nếu mảng gói dịch vụ rỗng, xóa tất cả liên kết gói dịch vụ với bệnh viện này
                await Package.updateMany(
                    { hospital: hospital._id },
                    { $unset: { hospital: "" } }
                );
            } else {
                // Nếu có gói dịch vụ, cập nhật liên kết cho các gói dịch vụ
                await Package.updateMany(
                    { _id: { $in: updateData.packages } },
                    { hospital: hospital._id }
                );
            }
        }

        // Trả về thông tin bệnh viện đã được cập nhật
        res.status(200).json(hospital);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/doctor/:doctorId',authMiddleware, async (req, res) => {
    try {
      const { doctorId } = req.params;
  
      // Tìm bác sĩ theo doctorId và lấy thông tin bệnh viện liên kết
      const doctor = await Doctor.findById(doctorId).populate('hospital');
  
      // Kiểm tra xem bác sĩ có tồn tại không
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Trả về thông tin bệnh viện
      if (!doctor.hospital) {
        return res.status(404).json({ message: 'Hospital not found for this doctor' });
      }
  
      return res.status(200).json(doctor.hospital);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

//Get   api/getbyderpartmene
router.get('/department/:departmentName', async (req, res) => {
    const departmentName = req.params.departmentName;
    try {
        // Tìm ID của khoa dựa trên tên khoa
        const department = await Department.findOne({ name: departmentName });

        if (!department) {
            return res.status(404).json({ message: 'Khoa không tồn tại.' });
        }

        // Tìm các bệnh viện liên kết với ID khoa
        const hospitals = await Hospital.find({ departments: department._id })
            .populate({
                path: 'doctors',
                select: 'image fullname specialty' // Chỉ lấy image, fullname, specialty của bác sĩ
            })
            .populate('departments') // Nếu bạn cũng muốn lấy thông tin phòng ban
            .populate('medicines') // Nếu bạn cũng muốn lấy thông tin thuốc
            .populate('packages') // Nếu bạn cũng muốn lấy thông tin gói
            .exec();

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
