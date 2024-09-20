const express = require('express');
const router = express.Router();
const Hospital = require('../../models/hospital'); // Import mô hình Hospital

// Lấy danh sách bệnh viện từ database
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find(); // Truy vấn tất cả bệnh viện
    console.log(hospitals)
    res.render('hospital', { hospitals }); // Render dữ liệu vào file hbs
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu bệnh viện' });
  }
});

module.exports = router;
