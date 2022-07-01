const { findOneByAnyFieldDAO } = require("../controller.DAO/usersDAO");

const checkEmail = async (email) => {
   try {
      const userFinded = await findOneByAnyFieldDAO({email});
      if(userFinded) return userFinded;
      return null;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   checkEmail
}