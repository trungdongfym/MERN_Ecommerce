const Joi = require('joi');

const addProductsSchema = Joi.object().keys({
   name: Joi.string().required(),
   preview: Joi.string().allow(''),
   price: Joi.number().positive(),
   note: Joi.string().allow(''),
   category: Joi.string().required(),
   image:Joi.string().required()
});

module.exports = {
   addProductsSchema
}