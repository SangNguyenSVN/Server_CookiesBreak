require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Import path module
const hbs = require('hbs'); // Import Handlebars
const app = express();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// MongoDB connection
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Set up Handlebars as the view engine
app.set('view engine', 'hbs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Error-handling middleware (optional, if you want to handle errors globally)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Import routes
const indexRouter = require('./routes/index');

// Use the routes from routes/index.js
app.use('/', indexRouter);

// Export the app for the server file
module.exports = app;
