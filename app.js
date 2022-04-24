require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Handle Errors
const { handleHttpErros } = require('./middlewares/handleErrors');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB_URL);
mongoose.connection.on('error', (err) => {
  console.log('Mongodb connection error::', err.message);
}).once('open', () => {
  console.log('Mongodb connected');
});

const app = express();

app.use('*', cors({
  origin: 'http://localhost:3000',
  maxAge: 300,
  credentials: true
}));

app.use(handleHttpErros);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});