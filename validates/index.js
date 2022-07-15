const { registerUserSchema, 
   loginUserSchema, 
   loginWith3rdPartySchema, 
   updateUserSchemaFunction,
   changePasswordSchema,
} = require('./userSchema');

const {
   addProductsSchema,
   addImportProductsSchema,
   updateProductsSchema
} = require('./productsSchema');

const {
   addCategorySchema,
   updateCategorySchema
} = require('./categorySchema');

const {
   addProductToCartSchema,
   updateCartSchema
} = require('./cartSchema');

const { validateDataRequest, validateData } = require('./validate');

module.exports = {
   registerUserSchema,
   loginUserSchema,
   validateDataRequest,
   loginWith3rdPartySchema,
   updateUserSchemaFunction,
   validateData,
   changePasswordSchema,
   addProductsSchema,
   addImportProductsSchema,
   updateProductsSchema,
   updateCategorySchema,
   addCategorySchema,
   addProductToCartSchema,
   updateCartSchema
}