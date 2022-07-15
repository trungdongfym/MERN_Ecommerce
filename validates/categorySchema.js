const Joi = require('joi');

const addCategorySchema = Joi.object().keys({
   name: Joi.string().required(),
   describe: Joi.string().allow(''),
   note: Joi.string().allow(''),
   avatarOfCate: Joi.string().required()
});

const updateCategorySchema = addCategorySchema.keys({
   avatarOfCate: Joi.string(),
   name: Joi.string()
});

module.exports = {
   addCategorySchema,
   updateCategorySchema
}