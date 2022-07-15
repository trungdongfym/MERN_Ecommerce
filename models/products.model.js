const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new Schema({
   name: { type: String, required: true },
   preview: { type: String },
   price: { type: Number, required: true },
   image: { type: String, required: true },
   note: { type: String },
   sale: { type: Number, default: 0 },
   category: { type: Schema.Types.ObjectId, required: true, ref: 'Categories' }
}, {
   versionKey: false,
   timestamps: true
});

const Products = mongoose.model('Products', productsSchema, 'Products');
module.exports = Products;

