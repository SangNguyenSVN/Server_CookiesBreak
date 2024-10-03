const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hàm đăng ký bệnh nhân
const registerPatient = async (req, res) => {
    try {
        const { username, password, fullname, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newPatient = new Patient({
            username,
            password: hashedPassword,
            fullname,
            email
        });

        await newPatient.save();
        res.status(201).json({ message: 'Patient registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm đăng ký bác sĩ
const registerDoctor = async (req, res) => {
    try {
        const { username, password, fullname, email, specialty } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newDoctor = new Doctor({
            username,
            password: hashedPassword,
            fullname,
            email,
            specialty
        });

        await newDoctor.save();
        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm đăng nhập
const login = async (req, res) => {
    const { username, password, role } = req.body; // role: 'patient' hoặc 'doctor'

    try {
        let user;
        if (role === 'patient') {
            user = await Patient.findOne({ username });
        } else if (role === 'doctor') {
            user = await Doctor.findOne({ username });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Tạo JWT token
        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerPatient,
    registerDoctor,
    login
};
