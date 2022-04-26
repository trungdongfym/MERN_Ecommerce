require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyparser = require('body-parser');

// Handle Errors
const { handleHttpErros } = require('./middlewares/handleErrors');
// Router
const routerAccount = require('./routes/customers/account.route');
const authRouter = require('./routes/auth.route');

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB_URL);
mongoose.connection.on('error', (err) => {
  console.log('Mongodb connection error::', err.message);
}).once('open', () => {
  console.log('Mongodb connected');
});

const app = express();
const Router = express.Router();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

// static file
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', cors({
  origin: 'http://localhost:3000',
  maxAge: 300,
  credentials: true
}));

Router.use('/user', routerAccount);
Router.use('/user', authRouter);

app.use('/api', Router);

app.use(handleHttpErros);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});