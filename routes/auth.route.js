const express = require('express');
const { loginUserSchema, validateDataRequest } = require('../validates/index');
const authRouter = express.Router();

authRouter.post('/login', validateDataRequest(loginUserSchema), async (req, res) => {
   console.log(req.body);
   res.send('ok');
});

module.exports = authRouter;