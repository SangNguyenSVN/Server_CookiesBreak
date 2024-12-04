const express = require('express');
const router = express.Router();
const Evaluation = require('../models/evalution');
const Hospital = require('../models/hospital'); // Mẫu bệnh viện (giả sử bạn đã có mô hình bệnh viện)
const Patient = require('../models/patient'); // Mẫu người dùng (giả sử bạn đã có mô hình người dùng)

// 1. Route để lấy tất cả đánh giá
router.get('/', async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate('hospital', 'name') // Lấy tên bệnh viện
      .populate('patient', 'fullname') // Lấy tên người dùng
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần
    res.status(200).json(evaluations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Route để thêm một đánh giá mới
router.post('/', async (req, res) => {
  try {
    const { score, comment, hospitalId, patientId } = req.body;

    // Kiểm tra bệnh viện và người dùng có tồn tại không
    const hospital = await Hospital.findById(hospitalId);
    const patient = await Patient.findById(patientId);

    if (!hospital || !patient) {
      return res.status(404).json({ message: 'Hospital or User not found' });
    }

    // Tạo mới đánh giá
    const newEvaluation = new Evaluation({
      score,
      comment,
      hospital: hospitalId,
      patient: patientId
    });

    await newEvaluation.save();
    return res.status(201).json(newEvaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Route để sửa một đánh giá cụ thể
router.put('/:evaluationId', async (req, res) => {
  const { evaluationId } = req.params;
  const { score, comment } = req.body;

  try {
    // Tìm và cập nhật đánh giá theo ID
    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Cập nhật thông tin
    evaluation.score = score || evaluation.score;
    evaluation.comment = comment || evaluation.comment;

    await evaluation.save();
    res.status(200).json(evaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Route để xóa một đánh giá cụ thể
router.delete('/:evaluationId', async (req, res) => {
    const { evaluationId } = req.params;
  
    try {
      // Tìm và xóa đánh giá theo ID
      const evaluation = await Evaluation.findByIdAndDelete(evaluationId);
  
      if (!evaluation) {
        return res.status(404).json({ message: 'Evaluation not found' });
      }
  
      res.status(200).json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/hospital/:hospitalId', async (req, res) => {
    const { hospitalId } = req.params;
  
    try {
      // Tìm các đánh giá có hospitalId tương ứng
      const evaluations = await Evaluation.find({ hospital: hospitalId })
        .populate('hospital', 'name') // Lấy tên bệnh viện
        .populate('patient', 'fullname') // Lấy tên người dùng
        .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần
  
      if (evaluations.length === 0) {
        return res.status(404).json({ message: 'No evaluations found for this hospital' });
      }
  
      res.status(200).json(evaluations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;
