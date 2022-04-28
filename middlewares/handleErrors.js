const httpErrors = require('../helpers/httpErrors');

const handleHttpErros = (err, req, res, next) => {
   if (err instanceof httpErrors) res.status(err.status).json(err.message);
   res.status(500).json('InternalServer Errors');
   res.end();
}

module.exports = {
   handleHttpErros
}