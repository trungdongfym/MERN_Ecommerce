const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
   user: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'Users'
   },
   listOrder: [{
      product: {
         type: mongoose.Types.ObjectId,
         required: true,
         ref: 'Products'
      },
      amount: {
         type: Number,
         required: true,
         min: 1
      }
   }]
}, {
   versionKey: false
});

const Cart = mongoose.model('Cart', cartSchema, 'Cart');
module.exports = Cart;