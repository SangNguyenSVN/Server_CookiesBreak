// controllers/authController.js
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Role = require('../models/role');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.logout = (req, res) => {
    // Bạn có thể lưu token vào blacklist ở đây nếu có
    const token = req.headers.authorization.split(' ')[1]; // Giả sử token được gửi qua header
    // Thêm token vào blacklist hoặc thực hiện bất kỳ logic nào bạn muốn

    // Gửi phản hồi thành công
    res.status(200).json({ message: 'Đăng xuất thành công' });
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
    const { username, password } = req.body;

    try {
        // Kiểm tra xem người dùng là bệnh nhân hay bác sĩ
        const user = await Patient.findOne({ username }) || await Doctor.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Lấy thông tin chi tiết của role
        const role = await Role.findById(user.role); // Truy vấn thông tin vai trò

        // Kiểm tra xem role có tồn tại không
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Tạo JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Hiển thị thông tin người dùng khi đăng nhập thành công
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                role: {
                    id: role._id, // ID của role
                    name: role.name, // Tên của role
                    permissions: role.permissions // Quyền hạn của role
                }
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


