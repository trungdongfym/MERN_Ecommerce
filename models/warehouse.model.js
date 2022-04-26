const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wareHouseSchema = new Schema({
   products: { type: Schema.Types.ObjectId, required: true, ref: 'Products' },
   amount: { type: Number, required: true },
   describe: { type: String }
}, {
   versionKey: false,
   timestamps: true
});

const WareHouse = mongoose.model('WareHouse', wareHouseSchema, 'WareHouse');
module.exports = WareHouse;