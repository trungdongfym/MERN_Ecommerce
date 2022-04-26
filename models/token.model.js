const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
   token: { type: String, required: true, unique: true },
   user: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Users' },
   expireAt: {
      type: Date,
      expires: ''
   }
}, {
   versionKey: false,
   timestamps: true
});

const Token = mongoose.model('Token', tokenSchema, 'Token');
module.exports = Token;