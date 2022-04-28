const Joi = require('joi');
const userConstants = require('../utils/constants/userConstants');
const { regexPassword } = require('../utils/paternRegex/userRegex')

exports.registerUserSchema = Joi.object().keys({
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

exports.loginUserSchema = Joi.object().keys({
   email: Joi.string().email({
      tlds: { allow: false }
   }).required(),
   password: Joi.string().required(),
   methodLogin: Joi.string().allow(userConstants.methodLoginEnum.normal).required(),
   rememberMe: Joi.boolean().default(true).required()
});

exports.loginWith3rdPartySchema = Joi.object().keys({
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
   methodLogin: Joi.string().allow(userConstants.methodLoginEnum.google, userConstants.methodLoginEnum.facebook),
});

exports.updateUserSchema = Joi.object().keys({

});