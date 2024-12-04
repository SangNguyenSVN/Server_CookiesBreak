// controllers/authController.js
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Hospital = require('../models/hospital');
const Admin = require('../models/admin')
const Role = require('../models/role');
require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.logout = (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log('Logout request received, token:', token);

        // Xử lý thêm token vào blacklist hoặc logic khác nếu cần
        // Nếu không có lỗi, gửi phản hồi thành công
        res.status(200).json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error during logout' });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra xem username và password có được cung cấp không
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Tìm admin theo username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // So sánh password được cung cấp với password đã được băm
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Trả về token và thông tin người dùng
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                username: admin.username, // Sửa tên biến từ 'user' thành 'admin' để tránh lỗi
                role: admin.role // Có thể trả thêm thông tin khác nếu cần
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

exports.registerAdmin = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check if the username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create new admin
        const newAdmin = new Admin({ username, password, role });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully', admin: { id: newAdmin._id, username: newAdmin.username, role: newAdmin.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering admin' });
    }
};

// Đăng ký bệnh nhân
// http://locahot:3001/api/auth/register/patient
exports.registerPatient = async (req, res) => {
    const { username, password, phoneNumber } = req.body;
    console.log("data reigster: ", req.body)
    // Kiểm tra xem tất cả các trường cần thiết đã được cung cấp chưa
    if (!username || !password || !phoneNumber) {
        return res.status(400).json({ message: 'Missing required fields: username, password, phoneNumber are required' });
    }

    try {
        // Kiểm tra xem bệnh nhân đã tồn tại chưa
        const existingPatient = await Patient.findOne({ username });
        if (existingPatient) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        // Tìm vai trò dựa trên tên vai trò
        const role = await Role.findOne({ name: 'patient' });
        if (!role) {
            return res.status(400).json({ message: 'Invalid role name' });
        }

        // Tạo bệnh nhân mới
        const patient = new Patient({
            username,
            password, // Mật khẩu đã được mã hóa trong mô hình
            phoneNumber,
            role: role._id, // Gán ID của vai trò
        });

        // Lưu bệnh nhân vào cơ sở dữ liệu
        await patient.save();

        // Trả về thông tin bệnh nhân cùng với thông tin vai trò
        res.status(201).json({
            message: 'Patient registered successfully',
            user: {
                id: patient._id,
                username: patient.username,
                phoneNumber: patient.phoneNumber,
                role: {
                    id: role._id,
                    name: role.name,
                    permissions: role.permissions,
                },
            },
        });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




// Đăng ký bác sĩ
exports.registerDoctor = async (req, res) => {
    const { fullname, username, password, phoneNumber, hospitalId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!fullname || !username || !password || !phoneNumber || !hospitalId) {
        return res.status(400).json({ message: 'Missing required fields: fullname, username, password, phoneNumber, roleId, and hospitalId are required' });
    }

    try {
        // Kiểm tra xem bác sĩ đã tồn tại chưa
        const existingDoctor = await Doctor.findOne({ username });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }

        // Kiểm tra xem vai trò có tồn tại không
        const role = await Role.findOne({ name: "doctor" });
        if (!role) {
            return res.status(400).json({ message: 'Invalid role name' });
        }

        // Kiểm tra xem bệnh viện có tồn tại không
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(400).json({ message: 'Invalid hospital ID' });
        }

        // Tạo mới bác sĩ
        const doctor = new Doctor({
            fullname,
            username,
            password, // Mật khẩu sẽ được băm trong model
            phoneNumber,
            role: role.id,
            hospital: hospitalId
        });

        // Lưu bác sĩ vào cơ sở dữ liệu
        await doctor.save();

        await Hospital.findByIdAndUpdate(hospitalId, { $addToSet: { doctors: doctor._id } });

        // Trả về thông tin bác sĩ cùng với thông tin vai trò
        res.status(201).json({
            message: 'Doctor registered successfully',
            user: {
                id: doctor._id,
                fullname: doctor.fullname,
                username: doctor.username,
                phoneNumber: doctor.phoneNumber,
                role: {
                    id: role._id,
                    name: role.name,
                    permissions: role.permissions
                },
                hospital: {
                    id: hospital._id,
                    name: hospital.name
                }
            }
        });
    } catch (error) {
        console.error('Error registering doctor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Đăng nhập
// controllers/authController.js
exports.login = async (req, res) => {
    const { username, password, userType } = req.body; // Thêm userType để xác định loại người dùng

    try {
        let user;

        // Tìm người dùng dựa trên userType
        if (userType === 'doctor') {
            user = await Doctor.findOne({ username }).populate('role');
        } else if (userType === 'patient') {
            user = await Patient.findOne({ username }).populate('role');
        } else {
            return res.status(400).json({
                message: 'Invalid user type. Please specify "doctor" or "patient".',
                token: null,
                user: null,
            });
        }

        // Kiểm tra xem người dùng có tồn tại không
        if (!user) {
            return res.status(401).json({
                message: 'Login successful, but no user found.',
                token: null,
                user: {
                    user: null,
                    role: null,
                }
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Login successful, but password is incorrect.',
                token: null,
                user: {
                    user: null,
                    role: null,
                }
            });
        }

        // Tạo token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Trả về dữ liệu người dùng và role
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user: {
                    id: user._id || "",
                    username: user.username || "",
                    phoneNumber: user.phoneNumber || "",
                    email: user.email || "",
                    gender: user.gender || "",
                    dateOfBirth: user.dateOfBirth ? user.dateOfBirth : null,
                    fullname: user.fullname || "",
                    hospital:user.hospital || "",
                    address: user.address || "",
                    image: user.image || "", // Thêm trường URL ảnh
                },
                role: user.role ? {
                    id: user.role._id || "",
                    name: user.role.name || "",
                    permissions: user.role.permissions || []
                } : {
                    id: "",
                    name: "",
                    permissions: []
                }
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy id người dùng từ token đã giải mã
        const { password, userType } = req.body; // Lấy password và userType từ req.body

        // Tạo đối tượng cập nhật
        const updateData = {};

        // Nếu có mật khẩu mới, thêm vào đối tượng cập nhật
        if (password) {
            updateData.password = password; // Thêm password vào updateData
        }

        // Xác định loại người dùng và cập nhật thông tin
        if (userType === 'doctor') {
            await Doctor.findByIdAndUpdate(userId, updateData, { new: true });
        } else if (userType === 'patient') {
            await Patient.findByIdAndUpdate(userId, updateData, { new: true });
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Trả về phản hồi thành công
        res.status(200).json({ message: 'Thông tin tài khoản đã được cập nhật thành công' });
    } catch (error) {
        console.error('Error updating account information:', error);
        res.status(500).json({ message: 'Lỗi trong quá trình cập nhật tài khoản', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;  // Token lấy từ URL
    const { newPassword } = req.body; // Mật khẩu mới từ người dùng

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Tìm người dùng dựa trên userId (doctor hoặc patient)
        let user;
        if (decoded.userType === 'doctor') {
            user = await Doctor.findById(userId);
        } else if (decoded.userType === 'patient') {
            user = await Patient.findById(userId);
        } else {
            return res.status(400).json({
                message: 'Invalid user type.',
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu cho người dùng
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: 'Password has been reset successfully.',
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};