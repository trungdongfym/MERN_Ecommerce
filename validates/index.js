const { registerUserSchema, loginUserSchema } = require('./userSchema');
const { validateDataRequest } = require('./validate');

module.exports = {
   registerUserSchema,
   loginUserSchema,
   validateDataRequest
}