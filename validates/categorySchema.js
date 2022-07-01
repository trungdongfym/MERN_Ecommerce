const Joi = require('joi');

const addCategorySchema = Joi.object().keys({
   name: Joi.string().required(),
   describe: Joi.string().allow(''),
   note: Joi.string().allow('')
});

module.exports = {
   addCategorySchema
}