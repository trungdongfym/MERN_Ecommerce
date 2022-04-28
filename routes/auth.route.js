const express = require('express');
const { loginUserSchema, loginWith3rdPartySchema, validateDataRequest } = require('../validates/index');
const { authRequire } = require('../middlewares/authRequire');
const httpErrors = require('../helpers/httpErrors');
const userConst = require('../utils/constants/userConstants');
const { loginNormal, loginThirdParty } = require('../controller/auth.controller');
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
         console.log(error);
         if (error instanceof httpErrors) {
            res.status(error.status).json(error.message);
            return;
         }
         res.status(500).json('Internal server errors!');
      }
   }
);

authRouter.post('/logout', authRequire(userConst.roleArray), async (req, res) => {

});

module.exports = authRouter;