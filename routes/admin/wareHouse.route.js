const express = require('express');
const { getWareHouseDAO } = require('../../controller.DAO/warehouseDAO');
const routerWarehoues = express.Router();
const httpErrors = require('../../helpers/httpErrors');
const WareHouse = require('../../models/warehouse.model');
const { authRequire } = require('../../middlewares/authRequire');
const { roleEnum } = require('../../utils/constants/userConstants');

routerWarehoues.get(
   '/getWarehouse',
   authRequire([roleEnum.Admin]),
   async (req, res) => {
      const { limit, skip, requireCate } = req.query;
      const badRequest = httpErrors.BadRequest('Query invalid!');
      if (limit && skip && isNaN(Number(limit)) || isNaN((Number(skip)))) {
         res.status(badRequest.status).json(badRequest.message);
         return;
      }
      const objectQuery = { limit, skip, requireCate };
      try {
         const productInStock = await getWareHouseDAO(objectQuery);
         const amountInStock = await WareHouse.find({}).count();
         res.json({ productInStock, amountInStock });
      } catch (error) {
         console.log(error);
         res.status(500).json('Server internal error!');
      }
   }
);

module.exports = routerWarehoues;