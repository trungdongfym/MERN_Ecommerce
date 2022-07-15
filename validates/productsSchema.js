const Joi = require('joi');
const { paymenTypeEnum, importProductStatusEnum } = require('../utils/constants/productsConstants');
const { regexPhoneNumber } = require('../utils/paternRegex/userRegex');

const addProductsSchema = Joi.object().keys({
   name: Joi.string().required(),
   preview: Joi.string().allow(''),
   price: Joi.number().positive().required(),
   note: Joi.string().allow(''),
   category: Joi.string().required(),
   image:Joi.string().required()
});

const updateProductsSchema = addProductsSchema.keys({
   name: Joi.string(),
   category: Joi.string(),
   image:Joi.string(),
   sale: Joi.number().positive().min(0).max(100).allow(0,''),
   price: Joi.number().positive()
});

const addImportProductsSchema = Joi.object().keys({
   titleImport: Joi.string().required(),
   supplierName: Joi.string().required(),
   phone: Joi.string().min(10).max(15).pattern(regexPhoneNumber).allow(''),
   note: Joi.string().allow(''),
   user: Joi.string().required(),
   payment: Joi.string().valid(paymenTypeEnum.cash, paymenTypeEnum.paypal),
   detailImportProducts: Joi.array()
      .items(Joi.object().keys({
         products:Joi.string().required(),
         amount: Joi.number().integer().required(),
         price: Joi.number().required()
      })).min(1)
});

const updateImportProductsSchema = addImportProductsSchema.keys({
   status: Joi.string().required()
});

module.exports = {
   addProductsSchema,
   addImportProductsSchema,
   updateImportProductsSchema,
   updateProductsSchema
}