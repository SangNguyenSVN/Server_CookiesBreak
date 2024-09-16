require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const app = express();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// MongoDB connection
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Simple route to check MongoDB connection
app.get('/', (req, res) => {
  res.send('MongoDB is connected');
});

// Error-handling middleware (optional, if you want to handle errors globally)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

module.exports = app;
