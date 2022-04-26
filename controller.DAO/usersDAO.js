const getModel = require('../models');
const { userModelPath } = require('../utils/constants/modelContants');
const Users = require('../models/users.model');
// const Users = getModel(userModelPath);

async function findOneByAnyFieldDAO(fieldNameObject) {
   try {
      const user = await Users.findOne({ ...fieldNameObject }, '-password').exec();
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

module.exports = {
   findOneByAnyFieldDAO,
   registerUserDAO
}