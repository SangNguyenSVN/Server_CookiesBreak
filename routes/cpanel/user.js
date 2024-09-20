// routes/cpanel/user.js
const express = require('express');
const router = express.Router();

// Danh sách người dùng giả lập
const users = [
  { id: 1, username: 'user1', role: 'admin' },
  { id: 2, username: 'user2', role: 'editor' }
];

// Lấy danh sách người dùng
router.get('/', (req, res) => {
  res.json(users);
});

// Thêm người dùng mới
router.post('/', (req, res) => {
  const { username, role } = req.body;
  const newUser = {
    id: users.length + 1,
    username,
    role
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Cập nhật thông tin người dùng
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, role } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.username = username;
    user.role = role;
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Xóa người dùng
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
