const express = require('express');
const router = express.Router();
const Hospital = require('../../models/hospital'); // Mô hình Hospital

// Lấy danh sách tất cả bệnh viện
router.get('/hospital-list', async (req, res) => {
  try {
    const hospitals = await Hospital.find(); // Lấy tất cả bệnh viện
    res.status(200).json(hospitals); // Trả về dữ liệu dưới dạng JSON
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu bệnh viện', error });
  }
});
// Lấy thông tin chi tiết bệnh viện theo ID
router.get('/hospital-list/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id); // Lấy bệnh viện theo ID
    if (hospital) {
      res.status(200).json(hospital);
    } else {
      res.status(404).json({ message: 'Bệnh viện không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin bệnh viện', error });
  }
});
// Cập nhật thông tin bệnh viện
router.put('/hospital-update/:id', async (req, res) => {
  const { hospital_name, hospital_address, hospital_phone } = req.body;
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { hospital_name, hospital_address, hospital_phone },
      { new: true }
    ); // Cập nhật bệnh viện theo ID
    if (updatedHospital) {
      res.status(200).json(updatedHospital);
    } else {
      res.status(404).json({ message: 'Bệnh viện không tồn tại' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật bệnh viện', error });
  }
});
// Xóa bệnh viện theo ID
router.delete('/hospital-delete/:id', async (req, res) => {
  try {
    const deletedHospital = await Hospital.findByIdAndDelete(req.params.id); // Xóa bệnh viện theo ID
    if (deletedHospital) {
      res.status(204).end(); // Trả về mã 204 No Content nếu xóa thành công
    } else {
      res.status(404).json({ message: 'Bệnh viện không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa bệnh viện', error });
  }
});


module.exports = router;
