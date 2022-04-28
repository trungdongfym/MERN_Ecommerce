const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
   name: { type: String, required: true },
   describe: { type: String },
   note: { type: String }
}, {
   versionKey: false,
});

const Categories = mongoose.model('Categories', categoriesSchema, 'Categories');
module.exports = Categories;