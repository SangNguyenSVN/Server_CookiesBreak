// routes/cpanel/doctor.js
const express = require('express');
const router = express.Router();

// Danh sách bác sĩ giả lập
const doctors = [
  { id: 1, name: 'Dr. A', specialization: 'Cardiologist' },
  { id: 2, name: 'Dr. B', specialization: 'Dermatologist' }
];

// Hiển thị danh sách bác sĩ
router.get('/', (req, res) => {
  res.render('doctor', { doctors });
});

// Thêm bác sĩ mới
router.post('/', (req, res) => {
  const { name, specialization } = req.body;
  const newDoctor = {
    id: doctors.length + 1,
    name,
    specialization
  };
  doctors.push(newDoctor);
  res.status(201).json(newDoctor);
});

// Cập nhật thông tin bác sĩ
router.put('/:id', (req, res) => {
  const doctorId = parseInt(req.params.id);
  const { name, specialization } = req.body;
  const doctor = doctors.find(d => d.id === doctorId);
  if (doctor) {
    doctor.name = name;
    doctor.specialization = specialization;
    res.json(doctor);
  } else {
    res.status(404).json({ message: 'Doctor not found' });
  }
});

// Xóa bác sĩ
router.delete('/:id', (req, res) => {
  const doctorId = parseInt(req.params.id);
  const index = doctors.findIndex(d => d.id === doctorId);
  if (index !== -1) {
    doctors.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Doctor not found' });
  }
});

module.exports = router;
