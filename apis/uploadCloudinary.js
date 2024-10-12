// apis/uploadCloudinary.js
const cloudinary = require('../config/cloudinary');
const upload = require('../config/multer'); // Gọi middleware upload
const express = require('express');
const router = express.Router();

// API upload hình ảnh lên Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Lấy URL của hình ảnh đã upload
    const url = file.path;

    // Trả về URL hình ảnh
    res.status(201).json({ status: 1, url });
  } catch (error) {
    console.error("Upload image error: ", error);
    res.status(500).json({ status: 0, message: 'Error uploading image', error });
  }
});

module.exports = router;
