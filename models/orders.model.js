const mongoose = require('mongoose');
const { statusOrderArray, statusOrderEnum } = require('../utils/constants/orderConstants');
const { paymenTypeArray } = require('../utils/constants/productsConstants');
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
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
   cart: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'Cart'
   }
}, {
   versionKey: false
});

const Orders = mongoose.model('Oders', ordersSchema, 'Orders');

module.exports = Orders;