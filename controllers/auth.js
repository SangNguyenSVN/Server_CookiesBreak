// controllers/authController.js
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
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


// Đăng ký bệnh nhân
exports.registerPatient = async (req, res) => {
    const { username, password, phoneNumber, roleId } = req.body;

    if (!username || !password || !phoneNumber || !roleId) {
        return res.status(400).json({ message: 'Missing required fields: username, password, phoneNumber, and roleId are required' });
    }

    try {
        const existingPatient = await Patient.findOne({ username });
        if (existingPatient) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        // Kiểm tra xem vai trò có tồn tại không
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(400).json({ message: 'Invalid role ID' });
        }

        // Tạo bệnh nhân mới
        const patient = new Patient({
            username,
            password, // Sử dụng mật khẩu chưa mã hóa
            phoneNumber,
            role: roleId,
        });

        // Lưu bệnh nhân vào cơ sở dữ liệu, mô hình sẽ tự động mã hóa mật khẩu
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
                    permissions: role.permissions
                }
            }
        });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




// Đăng ký bác sĩ
exports.registerDoctor = async (req, res) => {
    const { username, password, phoneNumber, roleId } = req.body; // Nhận roleId từ body

    // Kiểm tra các trường bắt buộc
    if (!username || !password || !phoneNumber || !roleId) {
        return res.status(400).json({ message: 'Missing required fields: username, password, phoneNumber, and roleId are required' });
    }

    try {
        // Kiểm tra xem bác sĩ đã tồn tại chưa
        const existingDoctor = await Doctor.findOne({ username });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }

        // Kiểm tra xem vai trò có tồn tại không
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(400).json({ message: 'Invalid role ID' });
        }

        // Tạo mới bác sĩ
        const doctor = new Doctor({
            username,
            password, // Sử dụng mật khẩu không băm, vì đã băm trong model
            phoneNumber,
            role: roleId, // Gán roleId cho bác sĩ
        });

        // Lưu bác sĩ vào cơ sở dữ liệu
        await doctor.save();

        // Trả về thông tin bác sĩ cùng với thông tin vai trò
        res.status(201).json({
            message: 'Doctor registered successfully',
            user: {
                id: doctor._id,
                username: doctor.username,
                phoneNumber: doctor.phoneNumber,
                role: {
                    id: role._id, // ID của role
                    name: role.name, // Tên của role
                    permissions: role.permissions // Quyền hạn của role
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
                    address: user.address || "",
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



