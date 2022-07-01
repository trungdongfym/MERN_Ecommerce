const mongoose = require('mongoose');
const userConstants = require('../utils/constants/userConstants');
const Schema = mongoose.Schema;
const { hashData } = require('../helpers/hashBscypt');

const userShema = new Schema({
   email: { type: String, required: true, unique: true, maxlength: 50, minlength: 3 },
   name: { type: String, required: true },
   password: {
      type: String,
      required: () => {
         return this.methodLogin === 'normal';
      }
   },
   methodLogin: {
      type: String,
      enum: userConstants.methodLoginArray,
      default: userConstants.methodLoginEnum.normal,
   },
   avatar: { type: String, default: '' },
   phone: { type: String, default: '' },
   address: { type: String, default: '' },
   gender:{
      type: String, 
      enum: userConstants.genderArray,
      default: userConstants.genderEnum.default,
      required:false
   },
   dateOfBirth: {
      type: Date,
      required:false
   },
   role: {
      type: String,
      enum: userConstants.roleArray,
      default: userConstants.roleEnum.Custommer
   }
}, {
   versionKey: false,
});

//Hash password previous save
userShema.pre('save', async function (next) {
   try {
      if (this.password) {
         if (this.password === '') {
            next();
            return;
         }
         this.password = await hashData(this.password);
      } else if (this.methodLogin !== userConstants.methodLoginEnum.normal) {
         this.password = ''
      } else throw new Error('Password invalid');
      next();
   } catch (error) {
      throw error;
   }
});

userShema.pre('updateOne', async function(next){
   try {
      const password = this?._update?.password;
      if(password) this._update.password = await hashData(password);
      next();
   } catch (error) {
      throw error;
   }
});

const Users = mongoose.model('Users', userShema, 'Users');
module.exports = Users;