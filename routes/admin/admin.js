// routes/admin.js
const express = require('express');
const router = express.Router();

// Admin login route
router.get('/login', (req, res) => {
  res.render('admin/login', { title: 'Admin Login' });
});

// Post login (authentication check)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Perform authentication logic here
  if (username === 'admin' && password === 'adminpass') {
    req.session.admin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { error: 'Invalid credentials' });
  }
});

// Admin dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

module.exports = router;
