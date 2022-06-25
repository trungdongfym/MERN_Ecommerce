// business logic common of user
const express = require('express');
const routerUserCommon = express.Router();
const { uploadImage } = require('../middlewares/uploadImage');
const {authRequire} = require('../middlewares/authRequire');
const {roleArray, pathImageEnum} = require('../utils/constants/userConstants');
const httpErrors = require('../helpers/httpErrors');
const {updateUserDAO} = require('../controller.DAO/usersDAO');
const { removeFileAsync } = require('../helpers/processFile');
const DataSendFormat = require('../helpers/dataPayload');
const {findOneByAnyFieldDAO} = require('../controller.DAO/usersDAO');

routerUserCommon.get(
   '/getUser/:userID',
   authRequire(roleArray),
   async (req, res) => {
      const {userID} = req.params;
      try {
         const userRetrieved = await findOneByAnyFieldDAO({_id:userID});
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
   uploadImage('avatar', './public/userAvatars') ,
   async (req, res) => {
      const { file = null } = req;
      if(file){
         // get path of img uploaded
         let filePath = file.path;
         const pathArr = filePath.split('\\');
         filePath = [process.env.BASE_URL,...pathArr.slice(1)].join('/');
         req.body.avatar = filePath;
      }
      // get user id for update user
      const {_id:userID = null} = req.body;
      if(!userID){
         const badRequestErr = httpErrors.BadRequest('No userid!');
         res.status(badRequestErr.status).json(badRequestErr.message).end();
      } else delete req.body._id; 
      
      try {
         const userUpdate = req.body;
         let oldPathAvt = null;
         // find old user to get old path of avatar
         if(file){
            const userOld = await findOneByAnyFieldDAO({_id:userID});
            const {avatar} = userOld;
            const avatarSplit = avatar.split('/');
            // get path avatar old to remove
            oldPathAvt = pathImageEnum.avatarPath + avatarSplit[avatarSplit.length-1];
         }
         const userUpdated = await updateUserDAO(userID, userUpdate);
         delete userUpdated._doc.password;
         const dataSend = new DataSendFormat(true, userUpdated, null);
         // if oldPathAvt is exists
         if(oldPathAvt){
            try {
               await removeFileAsync(oldPathAvt);
            } catch (error) {
            }
         }
         res.json(dataSend).end();
      } catch (error) {
         if(file) removeFileAsync(file.path);
         res.status(500).json(error.message).end();
      }
   }
);

routerUserCommon.post('/checkEmail', async (req,res) => {
   const { email } = req.body;
   if(email){
      try {
         const userFinded = await findOneByAnyFieldDAO({email});
         if(userFinded) res.json({isExist:true});
         else res.json({isExist:false});
      } catch (error) {
         res.status(500).json(error.message);
      }
   }else{
      const badRequestErr = httpErrors.BadRequest('Email not send!');
      res.status(badRequestErr.status).json(badRequestErr.message);
   }
});

module.exports = routerUserCommon;
