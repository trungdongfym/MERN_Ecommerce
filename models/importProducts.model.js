const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {importProductStatusArray, 
   paymenTypeArray, 
   importProductStatusEnum
} = require('../utils/constants/productsConstants');
const { regexPhoneNumber } = require('../utils/paternRegex/userRegex');

const importProductsSchema = new Schema({
   titleImport: { type: String, required: true },
   supplierName: { type: String, required: true },
   phone: { type: String, required: true, maxlength: 15, minlength: 10, match: regexPhoneNumber },
   note: { type: String },
   payment: { type: String, required: true, enum: paymenTypeArray },
   status: { type: String, 
      required: true, 
      enum:  importProductStatusArray, 
      default: importProductStatusEnum.Pending
   },
   user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' }
}, {
   versionKey: false,
   timestamps: true
});

const ImportProducts = mongoose.model('ImportProducts', importProductsSchema, 'ImportProducts');
module.exports = ImportProducts;
