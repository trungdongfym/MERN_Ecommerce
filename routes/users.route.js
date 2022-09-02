// business logic common of user
const express = require('express');
const routerUserCommon = express.Router();
const { uploadImage } = require('../middlewares/uploadImage');
const { authRequire, authOnlyOne } = require('../middlewares/authRequire');
const { roleArray, pathImageEnum, roleEnum } = require('../utils/constants/userConstants');
const httpErrors = require('../helpers/httpErrors');
const { updateUserDAO, updateOneUserDAO } = require('../controller.DAO/usersDAO');
const { removeFileAsync } = require('../helpers/processFile');
const DataSendFormat = require('../helpers/dataPayload');
const { findOneByAnyFieldDAO } = require('../controller.DAO/usersDAO');
const { updateUserSchemaFunction, validateData, changePasswordSchema } = require('../validates');
const { checkEmail } = require('../controller/user.controller');
const { checkDataHash } = require('../helpers/hashBscypt');
const Users = require('../models/users.model');

routerUserCommon.get(
   '/getUser/:userID',
   authRequire(roleArray),
   async (req, res, next) => {
      const { userID } = req.params;
      const accessToken = req.get('authorization').split(' ')[1];
      const notPermisionError = httpErrors.Forbiden('Not permission');
      try {
         const isPass = await authOnlyOne(userID, accessToken, [roleEnum.Admin]);
         if (isPass) next();
         else {
            res.status(notPermisionError.status).json(notPermisionError.message);
         }
      } catch (error) {
         res.status(error.status).json(error.message);
      }
   },
   async (req, res) => {
      const { userID } = req.params;
      try {
         const userRetrieved = await findOneByAnyFieldDAO({ _id: userID });
         // eliminate attribute unnesessary
         delete userRetrieved._doc.password;
         res.json(userRetrieved);
      } catch (error) {
         res.status(500).json(error.message);
      }
   }
)

routerUserCommon.post(
   '/updateUser',
   authRequire(roleArray),
   uploadImage('avatar', './public/userAvatars'),
   async (req, res, next) => {
      const { _id: userID = null } = req.body;
      const accessToken = req.get('authorization').split(' ')[1];
      const notPermisionError = httpErrors.Forbiden('Not permission');
      try {
         const isPass = await authOnlyOne(userID, accessToken, [roleEnum.Admin]);
         if (isPass) next();
         else {
            res.status(notPermisionError.status).json(notPermisionError.message);
         }
      } catch (error) {
         res.status(error.status).json(error.message);
      }
   },
   async (req, res, next) => {
      const data = req.body;
      const { file = null } = req;
      try {
         // delete field avatar
         const isValid = await validateData(updateUserSchemaFunction(data), data);
         if (isValid) {
            next();
         } else if (file) removeFileAsync(file.path);
      } catch (error) {
         if (file) removeFileAsync(file.path);
         next(error);
      }
   },
   async (req, res) => {
      const { file = null } = req;
      if (file) {
         // get path of img uploaded
         let filePath = file.path;
         const pathArr = filePath.split('\\');
         filePath = [process.env.BASE_URL, ...pathArr.slice(1)].join('/');
         req.body.avatar = filePath;
      }
      // get user id for update user
      const { _id: userID = null } = req.body;
      delete req.body._id;

      try {
         const userUpdate = req.body;
         let oldPathAvt = null;
         const userOld = await findOneByAnyFieldDAO({ _id: userID });
         // if userid for update not exist
         if (!userOld) {
            if (file) removeFileAsync(file.path);
            const badRequestErr = httpErrors.BadRequest('No userid!');
            res.status(badRequestErr.status).json(badRequestErr.message).end();
            return;
         }
         // find old user to get old path of avatar
         if (file) {
            const { avatar } = userOld;
            const avatarSplit = avatar.split('/');
            // get path avatar old to remove
            oldPathAvt = pathImageEnum.avatarPath + avatarSplit[avatarSplit.length - 1];
         }
         const userUpdated = await updateUserDAO(userID, userUpdate);
         delete userUpdated._doc.password;
         const dataSend = new DataSendFormat(true, userUpdated, null);
         // if oldPathAvt is exists
         if (oldPathAvt) {
            try {
               await removeFileAsync(oldPathAvt);
            } catch (error) {
            }
         }
         res.json(dataSend).end();
      } catch (error) {
         if (file) removeFileAsync(file.path);
         res.status(500).json(error.message).end();
      }
   }
);

routerUserCommon.post('/checkEmail', async (req, res) => {
   const { email } = req.body;
   if (email) {
      try {
         const userExist = await checkEmail(email);
         const isExist = userExist ? true : false;
         res.json({ isExist: isExist });
      } catch (error) {
         res.status(500).json(error.message);
      }
   } else {
      const badRequestErr = httpErrors.BadRequest('Email not send!');
      res.status(badRequestErr.status).json(badRequestErr.message);
   }
});

routerUserCommon.post(
   '/changePassword/:userID',
   authRequire(roleArray),
   async (req, res, next) => {
      const { userID } = req.params;
      const accessToken = req.get('authorization').split(' ')[1];
      const notPermisionError = httpErrors.Forbiden('Not permission');
      try {
         const isPass = await authOnlyOne(userID, accessToken, [roleEnum.Admin]);
         if (isPass) next();
         else {
            res.status(notPermisionError.status).json(notPermisionError.message);
         }
      } catch (error) {
         res.status(error.status).json(error.message);
      }
   },
   async (req, res, next) => {
      const data = req.body;
      try {
         const value = await validateData(changePasswordSchema, data);
         if (value) next();
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const dataPassChange = req.body;
      const { userID } = req.params;
      const badRequestErr = httpErrors.BadRequest('Missing userid!');

      if (userID) {
         const { newPassword, oldPassword } = dataPassChange;
         const user = await findOneByAnyFieldDAO({ _id: userID });
         const dataPayload = new DataSendFormat();
         // Check old password
         if (await checkDataHash(oldPassword, user.password)) {
            const result = await updateOneUserDAO({ password: newPassword }, userID);
            if (result.modifiedCount > 0) {
               dataPayload.setStatus = true;
               res.json(dataPayload);
            }
            else {
               dataPayload.setStatus = false;
               dataPayload.setErrors = new Error('Lỗi không xác định!');
               res.json(dataPayload);
            }
         } else {
            dataPayload.setStatus = false;
            dataPayload.setErrors = 'Mật khẩu cũ không chính xác!';
            res.json(dataPayload);
         }
      } else {
         res.status(badRequestErr.status).json(error.message);
         return;;
      }
   }
);

routerUserCommon.get(
   '/getUsers',
   authRequire([roleEnum.Admin]),
   async (req, res) => {
      const { limit, skip } = req.query;
      const badRequest = httpErrors.BadRequest('Query invalid!');
      if (isNaN(Number(limit)) || isNaN((Number(skip)))) {
         res.status(badRequest.status).json(badRequest.message);
         return;
      }

      try {
         const users = await Users.find({
            role: { $ne: roleEnum.Admin }
         }, '-password').skip(skip).limit(limit).exec();
         const countUsers = await Users.find({}).count();
         res.json({ users, amount: countUsers });
      } catch (error) {
         console.log(error);
         res.status(500).json('Server internal error!');
      }
   }
);

module.exports = routerUserCommon;
