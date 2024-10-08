// controllers/authController.js
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Đăng ký bệnh nhân
exports.registerPatient = async (req, res) => {
    const { username, password, phoneNumber } = req.body;

    try {
        // Kiểm tra xem bệnh nhân đã tồn tại chưa
        const existingPatient = await Patient.findOne({ username });
        if (existingPatient) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        // Tạo mới bệnh nhân với role mặc định là 'patient'
        const patient = new Patient({
            username,
            password,
            phoneNumber,
            role: 'patient', // Thêm role mặc định
        });

        // Lưu bệnh nhân vào cơ sở dữ liệu
        await patient.save();

        // Hiển thị thông tin bệnh nhân khi đăng ký thành công
        res.status(201).json({ 
            message: 'Patient registered successfully',
            user: {
                id: patient._id,
                username: patient.username,
                phoneNumber: patient.phoneNumber,
                role: patient.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Đăng ký bác sĩ
exports.registerDoctor = async (req, res) => {
    const { username, password, phoneNumber } = req.body;

    try {
        // Kiểm tra xem bác sĩ đã tồn tại chưa
        const existingDoctor = await Doctor.findOne({ username });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }

        // Tạo mới bác sĩ với role mặc định là 'doctor'
        const doctor = new Doctor({
            username,
            password,
            phoneNumber,
            role: 'doctor', // Thêm role mặc định
        });

        // Lưu bác sĩ vào cơ sở dữ liệu
        await doctor.save();

        // Hiển thị thông tin bác sĩ khi đăng ký thành công
        res.status(201).json({ 
            message: 'Doctor registered successfully',
            user: {
                id: doctor._id,
                username: doctor.username,
                phoneNumber: doctor.phoneNumber,
                role: doctor.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        let user;

        if (role === 'patient') {
            user = await Patient.findOne({ username });
        } else if (role === 'doctor') {
            user = await Doctor.findOne({ username });
        } else {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác' });
        }

        // Tạo JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Hiển thị thông tin người dùng khi đăng nhập thành công
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};
