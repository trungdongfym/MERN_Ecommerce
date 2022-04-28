const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailImportOrdersSchema = new Schema({
   products: { type: Schema.Types.ObjectId, required: true, ref: 'Products' },
   user: { type: Schema.Types.ObjectId, required: true, ref: 'ImportOrders' },
   amount: { type: Number, required: true }
}, {
   versionKey: false,
   timestamps: true
});

const DetailImportOrders = mongoose.model('DetailImportOrders', detailImportOrdersSchema, 'DetailImportOrders');
module.exports = DetailImportOrders;