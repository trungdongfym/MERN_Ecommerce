const mongoose = require('mongoose');
const { statusOrderArray, statusOrderEnum } = require('../utils/constants/orderConstants');
const { paymenTypeArray } = require('../utils/constants/productsConstants');
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
   user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'Users'
   },
   receiveAddress: {
      type: String,
      required: true
   },
   receivePhone: {
      type: String,
      required: true
   },
   paymentType: { type: String, required: true, enum: paymenTypeArray },
   statusOrder: {
      type: String,
      required: true,
      enum: statusOrderArray,
      default: statusOrderEnum.PENDING
   },
   note: { type: String },
   orderList: [{
      product: {
         type: mongoose.Types.ObjectId,
         required: true,
         ref: 'Products'
      },
      amount: {
         type: Number,
         required: true,
         min: 1
      },
      price: {
         type: Number,
         required: true,
      },
      sale: {
         type: Number,
         default: 0
      }
   }]
}, {
   versionKey: false,
   timestamps: true
});

const Orders = mongoose.model('Oders', ordersSchema, 'Orders');

module.exports = Orders;