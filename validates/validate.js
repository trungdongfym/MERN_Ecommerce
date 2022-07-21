const httpErrors = require('../helpers/httpErrors');

const validateDataRequest = () => async (req, res, next) => {
   const data = req.body;
   const validationSchema = req.validationSchema;
   delete req.validationSchema;
   if (!data) {
      res.json(httpErrors.BadRequest('No data body'));
      return;
   }
   try {
      const value = await validationSchema.validateAsync(data);
      if (value) next();
      else res.status(500).json('Lỗi server!');
   } catch (error) {
      if (error?.isJoi) {
         res.json(httpErrors.BadRequest(error.message))
         return;
      }
      res.status(500).json('Lỗi server!');
   }
}

const validateData = async (validationSchema, data) => {
   if (!data) {
      throw httpErrors.BadRequest('No data body');
   }
   try {
      const value = await validationSchema.validateAsync(data);
      return value;
   } catch (error) {
      if (error?.isJoi) {
         throw httpErrors.BadRequest(error.message);
      }
      throw new Error(error.message);
   }
}

module.exports = {
   validateDataRequest,
   validateData
}