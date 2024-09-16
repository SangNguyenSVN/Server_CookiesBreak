const express = require('express');
const router = express.Router();

// Route for the home page
router.get('/', (req, res) => {
  res.render('index', { title: 'My Dashboard', message: 'Welcome to the Dashboard!' });
});

module.exports = router;
