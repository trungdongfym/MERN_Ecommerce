const httpErrors = require('../helpers/httpErrors');

const validateDataRequest = (dataSchema) => async (req, res, next) => {
   const data = req.body;
   if (!data) {
      res.json(httpErrors.BadRequest('No data body'));
      return;
   }
   try {
      const value = await dataSchema.validateAsync(data);
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

module.exports = {
   validateDataRequest
}