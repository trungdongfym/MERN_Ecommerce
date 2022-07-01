const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {importProductStatusArray, paymenTypeArray} = require('../utils/constants/productsConstants');

const importProductsSchema = new Schema({
   titleImport: { type: String, required: true },
   supplierName: { type: String, required: true },
   phone: { type: String, required: true, maxlength: 13 },
   note: { type: String },
   payment: { type: String, required: true, enum: paymenTypeArray },
   status: { type: String, required: true, enum:  importProductStatusArray},
   user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' }
}, {
   versionKey: false,
   timestamps: true
});

const ImportProducts = mongoose.model('ImportProducts', importProductsSchema, 'ImportProducts');
module.exports = ImportProducts;
