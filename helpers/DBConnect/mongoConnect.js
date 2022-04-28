const mongoose = require('mongoose');

const mongoDBConnect = (url) => {
   mongoose.connect(url);
   mongoose.connection.on('error', (err) => {
      console.log('Mongodb connection error::', err.message);
   }).once('open', () => {
      console.log('Mongodb connected');
   });
   return mongoose;
}

module.exports = mongoDBConnect;