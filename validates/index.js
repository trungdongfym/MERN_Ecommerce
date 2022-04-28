const { registerUserSchema, loginUserSchema, loginWith3rdPartySchema } = require('./userSchema');
const { validateDataRequest } = require('./validate');

module.exports = {
   registerUserSchema,
   loginUserSchema,
   validateDataRequest,
   loginWith3rdPartySchema
}