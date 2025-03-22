require('dotenv').config();  // Make sure you have the dotenv package installed

const mongoose = require('mongoose');

// Use your connection URI here (or use dotenv to store it securely)
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
