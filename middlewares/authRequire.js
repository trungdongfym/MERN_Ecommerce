const httpErrors = require('../helpers/httpErrors');
const { verifyToken } = require('../helpers/processToken');
const { findOneByAnyField } = require('../DAO/usersDAO');

const authRequire = (roleArray) => {
   return async (req, res, next) => {
      const accessToken = req.get('authorization')?.split(' ')[1];
      if (!accessToken) {
         res.json(httpErrors.Unauthorized('Unauthorizaiton'));
         return;
      }
      
      try {
         const userPayload = await verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
         const { _id, role } = userPayload;
         if (roleArray.includes(role)) {
            res.json(httpErrors.Forbiden('Not permission'));
            return;
         }
         const realUser = await findOneByAnyField(_id);
         if (!realUser && role !== realUser.role) {
            res.status(401).json('Invalid token');
            return;
         }
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
         res.status(500).json('Internal server errors');
      }
   }
}

module.exports = {
   authRequire
}