const httpErrors = require('../helpers/httpErrors');

const handleHttpErros = (err, req, res, next) => {
   if (err instanceof httpErrors) {
      res.status(err.status).json(err.message);
      return;
   }
   res.status(500).json(err.message);
   return;
}

module.exports = {
   handleHttpErros
}