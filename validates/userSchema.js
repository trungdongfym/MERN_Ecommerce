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
         otherwise: Joi.string().pattern(regexPassword)
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
   methodLogin: Joi.string().required()
});

exports.updateUserSchema = Joi.object().keys({

});