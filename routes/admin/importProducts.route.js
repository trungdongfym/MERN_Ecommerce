const express = require('express');
const routerImportProducts = express.Router();
const {
   importProductsTransactionDAO,
   getImportProductsDAO,
   updateImportProductsTransactionDAO,
   deleteImportProductDAO
} = require('../../controller.DAO/importProductsDAO');
const { authRequire } = require('../../middlewares/authRequire');
const { roleEnum, roleArray } = require('../../utils/constants/userConstants');
const { addImportProductsSchema, validateData } = require('../../validates');
const httpErrors = require('../../helpers/httpErrors');
const ImportProducts = require('../../models/importProducts.model');
const { updateImportProductsSchema } = require('../../validates/productsSchema');
const { importProductStatusEnum } = require('../../utils/constants/productsConstants');
const { updateManyWarehouseDAO } = require('../../controller.DAO/warehouseDAO');


routerImportProducts.post(
   '/addImportProducts',
   authRequire([roleEnum.Admin, roleEnum.SaleStaff]),
   async (req, res, next) => {
      const importProduct = req.body;
      try {
         const isValid = await validateData(addImportProductsSchema, importProduct);
         if (isValid) {
            next();
         }
         else {
            res.status(500).json('Lỗi không xác định!');
            return;
         }
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      try {
         const importproduct = req.body;
         const importproductAdded = await importProductsTransactionDAO(importproduct);
         if (importproductAdded) {
            res.json(importproductAdded);
            return;
         } else {
            res.status(500).json('Lỗi không xác định!');
            return;
         }
      } catch (error) {
         res.status(500).json(error.message);
      }
   }
);

routerImportProducts.patch(
   '/updateImportProducts/:importID',
   authRequire([roleEnum.Admin]),
   async (req, res, next) => {
      const importProduct = req.body;
      try {
         const isValid = await validateData(updateImportProductsSchema, importProduct);
         if (isValid)
            next();
         else {
            res.status(500).json('Lỗi không xác định!');
            return;
         }
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const { importID } = req.params;
      const importProductUpdate = req.body;
      const badRequest = httpErrors.BadRequest('Invalid request!');
      try {
         const { status } = await ImportProducts.findById(importID).setOptions({
            lean: true
         });
         if (status !== importProductStatusEnum.Pending) {
            res.status(badRequest.status).json(badRequest.message);
            return;
         }
         const result = await updateImportProductsTransactionDAO(importProductUpdate, importID);
         if(result) {
            res.json({status: true});
            return;
         } else{
            res.json({status: false});
            return;
         }
      } catch (error) {
         res.status(500).json(error.message);
      }
   }
);

routerImportProducts.get(
   '/getImportProducts',
   authRequire([roleEnum.Admin]),
   async (req, res) => {
      let { limit, skip, requireUser, requireProducts, match } = req.query;
      // match = {_id:"62bfe568db1a9158c9fd15d9"}
      const badRequest = httpErrors.BadRequest('Invalid url!');
      try {
         if (limit) {
            limit = Number(limit);
            if (isNaN(limit)) {
               limit = null;
               res.status(badRequest.status).json(badRequest.message);
               return;
            }
         }
         if (skip) {
            skip = Number(skip);
            if (isNaN(skip)) {
               skip = null;
               res.status(badRequest.status).json(badRequest.message);
               return;
            }
         }
         const requireObject = { limit, skip, requireUser, requireProducts, match };
         const importProducts = await getImportProductsDAO(requireObject);
         if (limit || skip) {
            const amountImport = await ImportProducts.find({}).count();
            res.json({ importProducts, amount: amountImport });
            return;
         }
         res.json(importProducts);
      } catch (error) {
         res.status(500).json(error.message);
         return;
      }
   }
);

routerImportProducts.delete(
   '/deleteImportProduct/:importProductID',
   authRequire([roleEnum.Admin]),
   async (req, res) => {
      const {importProductID} = req.params;
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      if(!importProductID){
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      try {
         const statusDelete = await deleteImportProductDAO(importProductID);
         res.json({status: statusDelete});
      } catch (error) {
         res.status(500).json('Server internal error!');
      }
   }
);

module.exports = routerImportProducts;