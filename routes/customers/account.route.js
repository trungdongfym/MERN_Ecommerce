const express = require('express');
const { registerUserSchema, validateDataRequest } = require('../../validates');
const { findOneByAnyFieldDAO, registerUserDAO } = require('../../controller.DAO/usersDAO');
const httpErrors = require('../../helpers/httpErrors');

const routerAccount = express.Router();

routerAccount.post(
   '/register',
   validateDataRequest(registerUserSchema),
   async (req, res) => {
      const userData = req.body;
      const { email } = userData;
      try {
         const userContian = await findOneByAnyFieldDAO({ email });
         if (userContian) {
            const error = httpErrors.Conflict('Người dùng đã tồn tại!');
            res.status(error.status).json(error.message);
            return;
         }

         // Save user register
         const userAdded = await registerUserDAO(userData);
         if (userAdded) {
            // Delete password
            delete userAdded._doc.password;
            res.json(userAdded);
         }
         else res.status(500).json('Lỗi server!');
      } catch (error) {
         res.status(500).json('Lỗi server!');
      }
   }
);

module.exports = routerAccount;