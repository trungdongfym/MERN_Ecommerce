const { registerUserSchema, 
   loginUserSchema, 
   loginWith3rdPartySchema, 
   updateUserSchemaFunction,
   changePasswordSchema,
} = require('./userSchema');
const {
   addProductsSchema
} = require('./productsSchema');
const { validateDataRequest, validateData } = require('./validate');

module.exports = {
   registerUserSchema,
   loginUserSchema,
   validateDataRequest,
   loginWith3rdPartySchema,
   updateUserSchemaFunction,
   validateData,
   changePasswordSchema,
   addProductsSchema
}