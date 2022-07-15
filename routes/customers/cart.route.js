const express = require('express');
const routerCart = express.Router();
const httpErrors = require('../../helpers/httpErrors');
const Cart = require('../../models/cart.model');
const { addProductToCartSchema, updateCartSchema,validateData } = require('../../validates');
const { authOnlyOne, authRequire } = require('../../middlewares/authRequire');
const { roleEnum } = require('../../utils/constants/userConstants');

routerCart.get(
   '/cart',
   async (req, res) => {
      const { userID } = req.query;
      const badRequestUrl = httpErrors.BadRequest('URL invalid!');
      if (!userID) {
         res.status(badRequestUrl.status).json(badRequestUrl.message);
         return;
      }
      try {
         const cart = await Cart.findOne({ user: userID }).populate({
            path: 'listOrder.product',
         }).setOptions({ lean: true });
         const { listOrder = [] } = cart || {};
         res.json(listOrder);
      } catch (error) {
         res.status(500).json('Server internal error!');
      }
   }
);

routerCart.post(
   '/addProductToCart',
   async (req, res, next) => {
      const accessToken = req.get('authorization')?.split(' ')[1];
      const data = req.body;
      const { userID } = data || {};
      try {
         const isPass = await authOnlyOne(userID, accessToken, []);
         if (isPass) {
            next();
         } else {
            const notPermission = httpErrors.Forbiden('Not permission!');
            res.status(notPermission.status).json(notPermission.message);
         }
      } catch (error) {
         res.status(error?.status).json(error.message);
      }
   },
   async (req, res, next) => {
      const data = req.body;
      try {
         await validateData(addProductToCartSchema, data);
         next();
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const { cartItem, userID } = req.body;
      const { product: productID } = cartItem || {};

      try {
         const newCart = await Cart.findOneAndUpdate({
            user: userID,
            'listOrder.product': { $ne: productID }
         }, {
            user: userID,
            $push: {
               listOrder: cartItem
            }
         }, {
            upsert: true,
            new: true
         });
         if (newCart) {
            res.json({ status: true, message: 'Thêm vào giỏ hàng thành công!' });
         } else {
            res.json({ status: false, message: 'Thêm vào giỏ hàng thất bại!' });
         }
      } catch (error) {
         res.status(500).json('Server internal error!');
      }
   }
);

routerCart.put(
   '/updateCart/:userID',
   async (req, res, next) => {
      const data = req.body;
      try {
         await validateData(updateCartSchema, data);
         next();
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const { userID } = req.params;
      const listOrder = req.body;
      const badRequestUrl = httpErrors.BadRequest('URL invalid!');
      if (!userID) {
         res.status(badRequestUrl.status).json(badRequestUrl.message);
         return;
      }
      try {
         const newCart = await Cart.findOneAndUpdate({
            user: userID,
         }, {
            user: userID,
            listOrder: listOrder
         }, {
            upsert: true,
            new: true
         });
         if (newCart) {
            res.json({ status: true, message: 'Cập nhập giỏ hàng thành công!' });
         } else {
            res.json({ status: false, message: 'Cập nhập giỏ hàng thất bại!' });
         }
      } catch (error) {
         // console.log(error);
         res.status(500).json('Server internal error!');
      }
   }
);

module.exports = routerCart;