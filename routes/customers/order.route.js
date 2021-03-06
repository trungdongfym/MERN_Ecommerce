const express = require('express');
const routerOrders = express.Router();
const { validateData, addOrderSchema, updateOrderSchema } = require('../../validates');
const { authOnlyOne } = require('../../middlewares/authRequire');
const httpErrors = require('../../helpers/httpErrors');
const Orders = require('../../models/orders.model');
const { orderTransactionDAO } = require('../../controller.DAO/orderDAO');
const DataSendFormat = require('../../helpers/dataPayload');
const { roleArray, roleEnum } = require('../../utils/constants/userConstants');
const { authRequire } = require('../../middlewares/authRequire');

routerOrders.post(
   '/orders',
   async (req, res, next) => {
      const accessToken = req.get('authorization')?.split(' ')[1];
      const { user: userID } = req.body;
      try {
         const isPass = await authOnlyOne(userID, accessToken, []);
         if (!isPass) {
            const notPermission = httpErrors.Forbiden('Not permission!');
            res.status(notPermission.status).json(notPermission.message);
            return;
         }
         next();
      } catch (error) {
         res.status(error?.status).json(error.message);
      }
   },
   async (req, res, next) => {
      const data = req.body;
      try {
         await validateData(addOrderSchema, data);
         next();
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const newOrder = req.body;
      try {
         const orderSaved = await orderTransactionDAO(newOrder);
         const dataFormat = new DataSendFormat();
         if (!orderSaved) {
            dataFormat.setStatus = false;
            dataFormat.setPayload = null;
            dataFormat.setErrors = new Error('Remove cartItem error!');
            res.json(dataFormat);
            return;
         }
         dataFormat.setStatus = true;
         dataFormat.setPayload = orderSaved;
         dataFormat.setErrors = null;
         res.json(dataFormat);
      } catch (error) {
         res.status(500).json('Server internal error!');
      }
   }
);

routerOrders.get(
   '/orders',
   authRequire(roleArray),
   async (req, res) => {
      const { orderID } = req.query;
      const badRequestURL = httpErrors.BadRequest('No orderID!');
      const notPermission = httpErrors.Forbiden('Not permission!');
      if (!orderID) {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      try {
         const order = await Orders.findById(orderID).populate('orderList.product').exec();
         const { user: userID } = order;
         const { _id: ownerOderID } = req?.user;
         if (!ownerOderID?.toString() || userID?.toString() !== ownerOderID?.toString()) {
            res.status(notPermission.status).json(notPermission.message);
            return;
         }
         res.json(order);
      } catch (error) {
         res.status(500).json('Server internal errors!');
      }
   },
);

// update order
routerOrders.patch(
   '/orders/:orderID',
   async (req, res, next) => {
      const accessToken = req.get('authorization')?.split(' ')[1];
      const { orderID } = req.params;
      const badRequestURL = httpErrors.BadRequest('No orderID!');
      if (!orderID) {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      const order = await Orders.findById(orderID).setOptions({ lean: true });
      const { user: userID } = order;
      try {
         const isPass = await authOnlyOne(userID, accessToken, [roleEnum.Admin, roleEnum.Custommer]);
         if (!isPass) {
            const notPermission = httpErrors.Forbiden('Not permission!');
            res.status(notPermission.status).json(notPermission.message);
            return;
         }
         next();
      } catch (error) {
         res.status(error?.status).json(error.message);
      }
   },
   async (req, res, next) => {
      const data = req.body;
      try {
         await validateData(updateOrderSchema, data);
         next();
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      try {
         const orderUpdateData = req.body;
         const { orderID } = req.params;
         const result = await Orders.updateOne({ _id: orderID }, orderUpdateData);
         if (result.modifiedCount === 1) {
            res.json({ status: true, message: 'C???p nh???p ????n h??ng th??nh c??ng!' });
         } else {
            res.json({ status: false, message: 'C???p nh???p ????n h??ng th???t b???i!' });
         }
      } catch (error) {
         res.status(500).json('Server internal errors!');
      }
   }
)

module.exports = routerOrders;