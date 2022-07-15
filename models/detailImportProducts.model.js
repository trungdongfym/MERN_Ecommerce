const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailImportProductsSchema = new Schema({
   products: { type: Schema.Types.ObjectId, required: true, ref: 'Products' },
   importProducts: { type: Schema.Types.ObjectId, required: true, ref: 'ImportProducts' },
   amount: { type: Number, required: true },
   price: { type: Number, required: true }
}, {
   versionKey: false,
});

const DetailImportProducts = mongoose.model(
   'DetailImportProducts', 
   detailImportProductsSchema, 
   'DetailImportProducts'
);
module.exports = DetailImportProducts;