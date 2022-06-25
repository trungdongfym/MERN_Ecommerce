const getModel = require('../models');
const { userModelPath } = require('../utils/constants/modelContants');
const Users = require('../models/users.model');
// const Users = getModel(userModelPath);

async function findOneByAnyFieldDAO(fieldNameObject) {
   if (!fieldNameObject || (fieldNameObject && Object.keys(fieldNameObject).length === 0)) return null;
   try {
      const user = await Users.findOne({ ...fieldNameObject }).exec();
      return user;
   } catch (error) {
      throw error;
   }
}

async function registerUserDAO(userData) {
   try {
      const user = new Users(userData);
      const userSaved = user.save();
      return userSaved;
   } catch (error) {
      throw error;
   }
}

async function updateUserDAO(userID, userUpdate) {
   try {
      const userUpdated = await Users.findOneAndUpdate({_id:userID}, userUpdate, {
         new:true,
         runValidators:true
      }).exec();
      return userUpdated;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   findOneByAnyFieldDAO,
   registerUserDAO,
   updateUserDAO
}