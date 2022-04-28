const jwt = require('jsonwebtoken');
const tokenConst = require('../utils/constants/tokenConstants');

const verifyToken = async (token, type) => {
   try {
      switch (type) {
         case tokenConst.accessType:
            const accessPayload = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            return accessPayload;
         case tokenConst.refreshType:
            const refreshPayload = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            return refreshPayload;
         default:
            throw new Error('Invalid tokenType');
      }
   } catch (error) {
      throw error;
   }
}

const createToken = async (payload, type, options) => {
   try {
      switch (type) {
         case tokenConst.accessType:
            const accessToken = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
            return accessToken;
         case tokenConst.refreshType:
            const refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
            return refreshToken;
         default:
            throw new Error('Invalid tokenType');
      }
   } catch (error) {
      throw error;
   }
}

module.exports = {
   verifyToken,
   createToken
}