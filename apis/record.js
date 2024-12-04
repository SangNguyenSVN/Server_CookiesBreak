const express = require('express');
const router = express.Router();
const Record = require('../models/record');
const authMiddleware = require('../middleware/auth'); // Import middleware

// Route xem danh sách tất cả các record
router.get('/', async (req, res) => {
    try {
        const records = await Record.find().populate('appointment').populate('details.medicineId');
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route xem chi tiết một record theo ID
router.get('/:id',authMiddleware,  async (req, res) => {
    try {
        const record = await Record.findById(req.params.id).populate('appointment').populate('details.medicineId');
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route thêm một record mới
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { appointmentId, details } = req.body;
        console.log(req.body)
       
        const newRecord = new Record({
            appointment: appointmentId,
            details: details
        });

        // Lưu bản ghi mới
        await newRecord.save();

        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  


// Route cập nhật một record theo ID
router.put('/:id',authMiddleware,  async (req, res) => {
    try {
        const { appointment, details} = req.body;
        const updatedRecord = await Record.findByIdAndUpdate(
            req.params.id,
            { appointment, details },
            { new: true }
        ).populate('appointment').populate('details.medicineId');
        if (!updatedRecord) return res.status(404).json({ error: 'Record not found' });
        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route xóa một record theo ID
router.delete('/:id',authMiddleware,  async (req, res) => {
    try {
        const deletedRecord = await Record.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/appointment/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Tìm các bản ghi có appointmentId khớp
        const records = await Record.find({ appointment: appointmentId })
            .populate('details.medicineId');

        if (records.length === 0) {
            return res.status(404).json({ error: 'No records found for this appointment' });
        }

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
