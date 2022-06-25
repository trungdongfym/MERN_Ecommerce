const express = require('express');
const { loginUserSchema, loginWith3rdPartySchema, validateDataRequest } = require('../validates/index');
const { authRequire } = require('../middlewares/authRequire');
const httpErrors = require('../helpers/httpErrors');
const userConst = require('../utils/constants/userConstants');
const { loginNormal, loginThirdParty } = require('../controller/auth.controller');
const { verifyToken, createToken } = require('../helpers/processToken');
const tokenConst = require('../utils/constants/tokenConstants');
const redisClient = require('../helpers/DBConnect/redisConnect');
const DataSendFormat = require('../helpers/dataPayload');
const authRouter = express.Router();

authRouter.post('/login',
   (req, res, next) => {
      const { methodLogin } = req.body;
      if (methodLogin) {
         if (methodLogin === userConst.methodLoginEnum.normal)
            req.validationSchema = loginUserSchema;
         if (methodLogin !== userConst.methodLoginEnum.normal)
            req.validationSchema = loginWith3rdPartySchema;
      } else {
         res.status(400).json('Phương thức đăng nhập không hợp lệ');
         return;
      }
      next();
   },
   validateDataRequest(),
   async (req, res) => {
      const userLoginPayload = req.body;
      try {
         if (!userLoginPayload) {
            const error = httpErrors.BadRequest('Không có thông tin tài khoản!');
            throw error;
         }

         const { methodLogin } = userLoginPayload;
         if (methodLogin === userConst.methodLoginEnum.normal) {
            const dataLoginNormalRespone = await loginNormal(userLoginPayload);
            res.json(dataLoginNormalRespone);
            return;
         }
         if (methodLogin !== userConst.methodLoginEnum.normal) {
            const dataLoginThirdParty = await loginThirdParty(userLoginPayload);
            res.json(dataLoginThirdParty);
            return;
         }
         res.status(400).json('Phương thức đăng nhập không hợp lệ');
      } catch (error) {
         if (error instanceof httpErrors) {
            res.status(error.status).json(error.message);
            return;
         }
         res.status(500).json('Internal server errors!');
      }
   }
);

authRouter.post('/logout', authRequire(userConst.roleArray), async (req, res) => {
   const userLogout = req.body;
   if (!userLogout && Object.keys(userLogout) === 0) {
      const error = httpErrors.BadRequest('User logout invalid!');
      res.status(error.status).json(error.message);
      return;
   }
   // Check the user have session in redis
   const { _id } = userLogout;

   try {
      const sessionUser = await redisClient.hGetAll(`sessionID-${_id}`);
      const { rememberMe } = sessionUser;
      // If the user dont have require save session login
      if (!rememberMe) {
         await redisClient.del(`sessionID-${_id}`);
      }
      const resLogout = new DataSendFormat(true, true, null);
      res.json(resLogout);
   } catch (error) {
      res.status(500).json('Internal server errors!');
   }
});

authRouter.post('/refreshToken', async (req, res) => {
   const refreshTokenPayload = req.body;
   const { refreshToken } = refreshTokenPayload;
   if (!refreshToken) {
      const httpError = httpErrors.Unauthorized('None token!');
      res.status(httpError.status).json(httpError.message);
      return;
   }
   try {

      const userPayload = await verifyToken(refreshToken, tokenConst.refreshType);

      // Delete unnecessary data
      delete userPayload.iat;
      delete userPayload.exp;

      // Compare token in redis
      const refreshTokenRedis = await redisClient.hGet(`sessionID-${userPayload._id}`, 'refreshToken');
      if (refreshTokenRedis === refreshToken) {
         const accessToken = await createToken(userPayload, tokenConst.accessType, {
            expiresIn: tokenConst.accessTokenExpireTime
         });
         const newAccessTokenPayload = {
            token: accessToken,
            expiresIn: tokenConst.accessTokenExpireTime
         }
         res.json(newAccessTokenPayload);
      } else {
         const error = httpErrors.Unauthorized('Token invalid!');
         res.status(error.status).json(error.message);
      }
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
});

module.exports = authRouter;