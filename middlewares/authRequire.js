const httpErrors = require('../helpers/httpErrors');
const { verifyToken } = require('../helpers/processToken');
const { findOneByAnyFieldDAO } = require('../controller.DAO/usersDAO');
const tokenConst = require('../utils/constants/tokenConstants');

const authRequire = (roleArray) => {
   return async (req, res, next) => {
      const accessToken = req.get('authorization')?.split(' ')[1];
      if (!accessToken) {
         const unAuthorization = httpErrors.Unauthorized('Unauthorizaiton');
         res.status(unAuthorization.status).json(unAuthorization.message);
         return;
      }

      try {
         const userPayload = await verifyToken(accessToken, tokenConst.accessType);
         const { _id, role } = userPayload;
         if (!roleArray.includes(role)) {
            res.json(httpErrors.Forbiden('Not permission'));
            return;
         }
         const realUser = await findOneByAnyFieldDAO({ _id });
         if (!realUser || (realUser && role !== realUser.role)) {
            res.status(401).json('Invalid token');
            return;
         }
         req.user = realUser;
         next();
      } catch (error) {
         if (error?.name === 'TokenExpiredError') {
            res.status(401).json('Token expired');
            return;
         }
         if (error?.name === 'JsonWebTokenError') {
            res.status(401).json(error.message);
            return;
         }
         res.status(500).json(error.message);
      }
   }
}

const authOnlyOne = async (checkID, accessToken, priorityRoleArray) => {
   try {
      if(!accessToken){
         throw httpErrors.Unauthorized('Not token!');
      }
      const userPayload = await verifyToken(accessToken, tokenConst.accessType);
      const { _id, role } = userPayload;
      if (priorityRoleArray.includes(role)) {
         return true;
      }
      if(checkID !== _id){
         return false;
      }
      return true;
   } catch (error) {
      if (error?.name === 'TokenExpiredError') {
         throw httpErrors.Unauthorized('Token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
         throw httpErrors.Unauthorized(error.message);
      }
      throw new httpErrors(500, error.message);
   }
}

module.exports = {
   authRequire,
   authOnlyOne
}