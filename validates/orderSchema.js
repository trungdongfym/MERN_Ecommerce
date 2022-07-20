const Joi = require('joi');
const { regexPhoneNumber } = require('../utils/paternRegex/userRegex');
const { paymenTypeArray } = require('../utils/constants/productsConstants');
const { statusOrderArray } = require('../utils/constants/orderConstants');

const addOrderSchema = Joi.object().keys({
   user:
      Joi.string()
         .required(),
   receiveAddress:
      Joi.string()
         .required(),
   receivePhone:
      Joi.string()
         .min(10)
         .max(15)
         .pattern(regexPhoneNumber)
         .required(),
   note:
      Joi.string().allow(''),
   paymentType:
      Joi.string()
         .valid(...paymenTypeArray)
         .required(),
   orderList:
      Joi.array()
         .items(
            Joi.object().keys({
               product: Joi.string().required(),
               amount: Joi.number().integer().positive().required(),
               price: Joi.number().positive().required(),
               sale: Joi.number()
            })
         )
});

const updateOrderSchema = Joi.object().keys({
   user: Joi.string(),
   receiveAddress: Joi.string(),
   receivePhone:
      Joi.string()
         .min(10)
         .max(15)
         .pattern(regexPhoneNumber),
   note: Joi.string().allow(''),
   paymentType:
      Joi.string()
         .valid(...paymenTypeArray),
   statusOrder:
      Joi.string()
         .valid(...statusOrderArray),
});

module.exports = {
   addOrderSchema,
   updateOrderSchema
}