const bscrypt = require('bcrypt');

const saltRound = 10;

const hashData = async (dataHash) => {
   try {
      const dataHashed = await bscrypt.hash(dataHash, saltRound);
      return dataHashed;
   } catch (error) {
      throw error;
   }
}

const checkDataHash = async (dataCheck, dataHash) => {
   try {
      const isValid = await bscrypt.compare(dataCheck, dataHash);
      return isValid;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   hashData,
   checkDataHash
}