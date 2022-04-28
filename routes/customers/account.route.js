const express = require('express');
const { registerUserSchema, validateDataRequest } = require('../../validates');
const httpErrors = require('../../helpers/httpErrors');
const { registerUser } = require('../../controller/auth.controller');

const routerAccount = express.Router();

routerAccount.post(
   '/register',
   validateDataRequest(registerUserSchema),
   async (req, res) => {
      const userData = req.body;
      try {
         const userRegisted = await registerUser(userData);
         if (userRegisted) {
            res.json(userRegisted);
            return;
         } else res.status(500).json('Lỗi server!');
      } catch (error) {
         if (error instanceof httpErrors) {
            res.status(error.status).json(error.message);
            return;
         }
         res.status(500).json(error.message);
      }
   }
);

module.exports = routerAccount;