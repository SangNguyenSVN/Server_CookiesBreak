// routes/cpanel/report.js
const express = require('express');
const router = express.Router();

// Danh sách báo cáo giả lập
const reports = [
  { id: 1, title: 'Report A', content: 'Content of report A' },
  { id: 2, title: 'Report B', content: 'Content of report B' }
];

// Lấy danh sách báo cáo
router.get('/', (req, res) => {
  res.json(reports);
});

// Thêm báo cáo mới
router.post('/', (req, res) => {
  const { title, content } = req.body;
  const newReport = {
    id: reports.length + 1,
    title,
    content
  };
  reports.push(newReport);
  res.status(201).json(newReport);
});

// Cập nhật thông tin báo cáo
router.put('/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const { title, content } = req.body;
  const report = reports.find(r => r.id === reportId);
  if (report) {
    report.title = title;
    report.content = content;
    res.json(report);
  } else {
    res.status(404).json({ message: 'Report not found' });
  }
});

// Xóa báo cáo
router.delete('/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const index = reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    reports.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Report not found' });
  }
});

module.exports = router;
