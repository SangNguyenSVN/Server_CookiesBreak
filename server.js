require('dotenv').config(); // Load environment variables

const express = require('express');
const path = require('path'); // Import path module
const hbs = require('hbs'); // Import Handlebars
const app = express();

const mongoose = require('mongoose');
require('./models/hospital');
// MongoDB connection string
const mongoURI = process.env.MONGO_URI ;

// MongoDB connection
mongoose
  .connect(mongoURI,{})
  .then(() => console.log('MongoDB connected successfully: http://localhost:3000' ))
  .catch((err) => console.error('MongoDB connection error:', err));

// Set up Handlebars as view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON bodies
app.use(express.json());

// Import routes
const indexRouter = require('./routes/index');

// Import API
const hospitalAPIRoute = require('./routes/apis/hospitalAPI');

// Use routes
app.use('/', indexRouter);

// User APIs
app.use('/hospital-api', hospitalAPIRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});



module.exports = app;
