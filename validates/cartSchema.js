const Joi = require('Joi');

const addProductToCartSchema = Joi.object().keys({
   cartItem: Joi.object().keys({
      product: Joi.string().required(),
      amount: Joi.number().positive().min(1).required()
   }).required(),
   userID: Joi.string().required()
});

const updateCartSchema = Joi.array().items(
   Joi.object().keys({
      product: Joi.string().required(),
      amount: Joi.number().positive().required().min(1)
   })
).unique('product');

module.exports = {
   addProductToCartSchema,
   updateCartSchema
}