const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const importOrdersSchema = new Schema({
   receiveAddress: { type: String, required: true },
   phone: { type: String, required: true, maxlength: 13 },
   note: { type: String },
   payment: [{ type: String, required: true, enum: ['cash', ''] }],
   user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' }
}, {
   versionKey: false,
   timestamps: true
});

const ImportOrders = mongoose.model('ImportOrders', importOrdersSchema, 'ImportOrders');
module.exports = ImportOrders;
