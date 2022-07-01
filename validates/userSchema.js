const Joi = require('joi');
const { checkEmail } = require('../controller/user.controller');
const userConstants = require('../utils/constants/userConstants');
const { regexPassword, regexNoSpace } = require('../utils/paternRegex/userRegex')

const registerUserSchema = Joi.object().keys({
   name: Joi.string().required(),
   email: Joi.string()
      .email({
         tlds: { allow: false }
      })
      .required(),
   password: Joi.when(
      'methodLogin',
      {
         is: userConstants.methodLoginEnum.normal,
         then: Joi.string().pattern(regexPassword).required(),
         otherwise: Joi.string().allow('')
      }
   ),
   confirmPassword: Joi.ref('password'),
   phone: Joi.string(),
   address: Joi.string(),
   methodLogin: Joi.string()
      .valid(...userConstants.methodLoginArray)
      .default(userConstants.methodLoginEnum.normal),
   role: Joi.string()
      .valid(...userConstants.roleArray)
      .default(userConstants.roleEnum.Custommer),
});

const loginUserSchema = Joi.object().keys({
   email: Joi.string().email({
      tlds: { allow: false }
   }).required(),
   password: Joi.string().required(),
   methodLogin: Joi.string().valid(userConstants.methodLoginEnum.normal).required(),
   rememberMe: Joi.boolean().default(true).required()
});

const loginWith3rdPartySchema = Joi.object().keys({
   user: Joi.object().keys({
      uid: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().allow(''),
      avatar: Joi.string().allow(''),
   }),
   token: Joi.object().keys({
      refreshToken: Joi.string().required(),
      accessToken: Joi.string().required()
   }),
   isNewUser: Joi.boolean().required(),
   rememberMe: Joi.boolean().required(),
   methodLogin: Joi.string().valid(userConstants.methodLoginEnum.google, userConstants.methodLoginEnum.facebook),
});

function updateUserSchemaFunction(data){
   const updateUserSchema = Joi.object().keys({
      _id:Joi.string().required(),
      name:Joi.string().required(),
      email:Joi.string().external( async(email,helper)=>{ //custom validate async function
         try {
            const user = await checkEmail(email);
            const { _id: userUpdateId = null } = data; //id of the user need update
            const userEmailExist = user?.id; //id of the user whose email the updater wants to update
            if(userUpdateId && userUpdateId===userEmailExist) return email;
            if(user) {
               throw new Error('Email đã tồn tại!');
            }
            return email;
         } catch (error) {
            throw new Error(error.message);
         }
      },'Email is exist!').required(),
      address:Joi.string().allow(''),
      phone:Joi.string().allow(''),
      gender:Joi.string().allow(''),
      dateOfBirth:Joi.date().allow(null).allow(''),
   });
   return updateUserSchema;
}

const changePasswordSchema = Joi.object().keys({
   oldPassword:Joi.string().required().pattern(regexNoSpace),
   newPassword:Joi.string()
      .pattern(regexPassword)
      .pattern(regexNoSpace)
      .required()
      .invalid(Joi.ref('oldPassword')),
   confirmNewPassword:Joi.string()
      .pattern(regexNoSpace)
      .valid(Joi.ref('newPassword')),
});

module.exports={
   updateUserSchemaFunction,
   registerUserSchema,
   loginUserSchema,
   loginWith3rdPartySchema,
   changePasswordSchema
}