const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET; // Sử dụng biến môi trường

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Token:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, secretKey); // Xác thực token
        req.user = verified; // Gán thông tin người dùng đã xác thực vào request
        console.log("Decoded:", verified); // Nếu token hợp lệ
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
