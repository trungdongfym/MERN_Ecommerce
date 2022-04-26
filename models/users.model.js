const mongoose = require('mongoose');
const userConstants = require('../utils/constants/userConstants');
const Schema = mongoose.Schema;
const { hashData } = require('../helpers/hashBscypt');

const userShema = new Schema({
   email: { type: String, required: true, unique: true, maxlength: 50, minlength: 3 },
   password: {
      type: String, required: () => {
         return this.methodLogin === 'normal';
      }
   },
   methodLogin: {
      type: String,
      enum: userConstants.methodLoginArray,
      default: userConstants.methodLoginEnum.normal,
   },
   avatar: { type: String },
   phone: { type: String, },
   address: { type: String },
   role: {
      type: String,
      enum: userConstants.roleArray,
      default: userConstants.roleEnum.Custommer
   }
}, {
   versionKey: false,
});

//Hash password previous save
userShema.pre('save', async function (next)  {
   try {
      if (this.password) {
         this.password = await hashData(this.password);
      } else throw new Error('Password invalid');
      next();
   } catch (error) {
      throw error;
   }
});

const Users = mongoose.model('Users', userShema, 'Users');
module.exports = Users;