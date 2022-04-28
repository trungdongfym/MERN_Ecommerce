const httpErrors = require('../helpers/httpErrors');
const { findOneByAnyFieldDAO, registerUserDAO } = require('../controller.DAO/usersDAO');
const { createToken } = require('../helpers/processToken');
const { checkDataHash } = require('../helpers/hashBscypt');
const customErrors = require('../helpers/customErrors');
const userConst = require('../utils/constants/userConstants');
const tokenConst = require('../utils/constants/tokenConstants');
const DataSendFormat = require('../helpers/dataPayload');
const redisClient = require('../helpers/DBConnect/redisConnect');
const { authFirebase } = require('../firebase');

const createDataLoginUserSent = async (user, rememberMe) => {
   try {
      const { email, role, avatar, methodLogin } = user;
      const userID = user._id;
      const userPayload = { email, role, avatar, _id: userID, methodLogin };

      const accessToken = await createToken(userPayload, tokenConst.accessType, {
         expiresIn: tokenConst.accessTokenExpireTime
      });

      // Get sessionID from redis
      const sessionInfo = await redisClient.hGetAll(`sessionID-${userID}`);
      const { refreshToken: refreshTokenExist } = sessionInfo;
      let refreshToken = refreshTokenExist;

      // Save accessToken to redis if the token not exist
      if (!refreshTokenExist) {
         // Create a new Token
         refreshToken = await createToken(userPayload, tokenConst.refreshType, {
            expiresIn: tokenConst.refreshTokenExpireTime
         });
         // Save to redis
         redisClient.hSet(`sessionID-${userID}`, 'refreshToken', refreshToken);
         redisClient.hSet(`sessionID-${userID}`, 'rememberMe', rememberMe);
         redisClient.expire(`sessionID-${userID}`, tokenConst.refreshTokenExpireTime);
      }

      const payloadSend = {
         user: userPayload,
         accessToken: {
            token: accessToken,
            expiresIn: tokenConst.accessTokenExpireTime
         },
         refreshToken: {
            token: refreshToken,
            expiresIn: tokenConst.refreshTokenExpireTime
         }
      }

      const dataSendFormat = new DataSendFormat(true, payloadSend, null);
      return dataSendFormat;
   } catch (error) {
      throw error;
   }
}

const registerUser = async (userData) => {
   const { email } = userData;
   try {
      const usercontain = await findOneByAnyFieldDAO({ email });
      if (usercontain) {
         const error = httpErrors.Conflict('Người dùng đã tồn tại!');
         throw error;
      }

      // Save user register
      const userAdded = await registerUserDAO(userData);
      if (userAdded) {
         // Delete password
         delete userAdded._doc.password;
         return userAdded;
      }
      else throw new Error('Lỗi server!');
   } catch (error) {
      throw error;
   }
}

const loginNormal = async (userLoginPayload) => {

   const customErrorPayload = new DataSendFormat(false, null,
      customErrors.invalidAccount('Tài khoản hoặc mật khẩu không chính xác!')
   );

   const { email, password, rememberMe } = userLoginPayload;
   try {
      const userReal = await findOneByAnyFieldDAO({ email });
      if (userReal) {
         const isCorrectPassword = await checkDataHash(password, userReal.password);
         // If the password is correct
         if (isCorrectPassword) {
            userReal._id = userReal.id;
            const dataUserLoginSent = await createDataLoginUserSent(userReal, rememberMe);
            return dataUserLoginSent;
         } else {// If password not correct
            return customErrorPayload;
         }
      } else {
         return customErrorPayload;
      }
   } catch (error) {
      throw error;
   }
}

const loginThirdParty = async (userLoginPayload) => {
   const customError = customErrors.invalidAccount('Account invalid!');
   const customErrorPayload = new DataSendFormat(false, null,
      customError
   );
   try {
      const { isNewUser, rememberMe, methodLogin, user, token } = userLoginPayload;
      const { uid, email } = user;
      // Verify with firebase admin
      const userPayloadThirdParty = await authFirebase.verifyIdToken(token.accessToken);
      const { uid: uidReal } = userPayloadThirdParty;
      if (uid !== uidReal) return customErrorPayload;

      // Create userdata
      delete user.uid;
      user.role = userConst.roleEnum.Custommer;
      user.methodLogin = methodLogin;
      // End create userdata
      let userSaved = null;
      if (isNewUser) {
         // Save user to mongodb
         userSaved = await registerUser(user);
      } else userSaved = await findOneByAnyFieldDAO({ email });
      if (!userSaved) throw new Error('Không lưu được người dùng mới!');
      // Create user data sent do client
      userSaved._id = userSaved.id;
      console.log(userSaved);
      const dataUserLoginSent = await createDataLoginUserSent(userSaved, rememberMe);
      return dataUserLoginSent;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   registerUser,
   loginNormal,
   loginThirdParty
}