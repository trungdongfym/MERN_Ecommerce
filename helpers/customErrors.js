const errorConsts = require('../utils/constants/errorConstants');

class CustomErrors {

   constructor(type, message) {
      this.message = message;
      this.type = type;
   }

   static invalidAccount(message) {
      return new CustomErrors(errorConsts.Invalid_Account, message);
   }
}

module.exports = CustomErrors;