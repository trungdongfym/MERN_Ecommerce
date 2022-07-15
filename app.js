require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyparser = require('body-parser');

const mongoDBConnect = require('./helpers/DBConnect/mongoConnect');
const redisClient = require('./helpers/DBConnect/redisConnect');
// Handle Errors
const { handleHttpErros } = require('./middlewares/handleErrors');
// Router
const routerAccount = require('./routes/customers/account.route');
const authRouter = require('./routes/auth.route');
const routerUserCommon = require('./routes/users.route');
const routerCategories = require('./routes/admin/categories.route');
const routerProducts = require('./routes/products.route');
const routerImportProducts = require('./routes/admin/importProducts.route');
const routerWarehoues = require('./routes/admin/wareHouse.route');
const routerCart = require('./routes/customers/cart.route');

// Database connect
mongoDBConnect(process.env.DB_URL);
redisClient.connect();

const PORT = process.env.PORT || 5000;

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
Router.use('/user', routerUserCommon);
Router.use('/admin', routerCategories);
Router.use('/admin', routerImportProducts);
Router.use('/admin', routerWarehoues);
Router.use('/', routerProducts);
Router.use('/', routerCart);

app.use('/api', Router);

app.use(handleHttpErros);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});