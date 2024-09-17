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


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


const indexRouter = require('./routes/index');
const productRoute= require('./routes/product')

// http://localhost:3000
app.use('/', indexRouter);
app.use('/product', productRoute)


module.exports = app;
