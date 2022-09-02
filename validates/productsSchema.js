const Joi = require('joi');
const { paymenTypeEnum, importProductStatusEnum } = require('../utils/constants/productsConstants');
const { regexPhoneNumber } = require('../utils/paternRegex/userRegex');

const addProductsSchema = Joi.object().keys({
   name: Joi.string().required(),
   preview: Joi.string().allow(''),
   price: Joi.number().positive().required(),
   note: Joi.string().allow(''),
   category: Joi.string().required(),
   image: Joi.string().required()
});

const updateProductsSchema = addProductsSchema.keys({
   name: Joi.string(),
   category: Joi.string(),
   image: Joi.string(),
   sale: Joi.number().positive().min(0).max(100).allow(0, ''),
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
         products: Joi.string().required(),
         amount: Joi.number().integer().required(),
         price: Joi.number().required()
      })).min(1)
});

const updateImportProductsSchema = addImportProductsSchema.keys({
   status: Joi.string().required()
});

const queryProductSchema = Joi.object().keys({
   search: Joi.string().trim(),
   filter: Joi.object().keys({
      price: Joi.object().keys({
         minPrice: Joi.number()
            .integer()
            .min(0)
            .required(),
         maxPrice: Joi.number()
            .integer()
            .min(Joi.ref('minPrice'))
            .required(),
      }),
      cateId: Joi.string()
   }),
   pagination: Joi.object().keys({
      page: Joi.number().integer().min(0).required(),
      pageSize: Joi.number().integer().positive().required(),
   }),
   sort: Joi.object().keys({
      _id: Joi.number().valid(1, -1),
      bestsell: Joi.number().valid(1, -1),
      price: Joi.number().valid(1, -1),
   }).xor('_id', 'price', 'bestsell')
      .error(new Error('Sort field in valid!'))
});

module.exports = {
   addProductsSchema,
   addImportProductsSchema,
   updateImportProductsSchema,
   updateProductsSchema,
   queryProductSchema
}