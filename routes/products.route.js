const express = require('express');
const routerProducts = express.Router();
const {addProductsSchema, validateData} = require('../validates');
const {uploadImage} = require('../middlewares/uploadImage');
const { removeFileAsync } = require('../helpers/processFile');
const httpErrors = require('../helpers/httpErrors');
const { addProductsDAO, getCountProductsDAO, getProductsDAO, searchProductsDAO } = require('../controller.DAO/productsDAO');
const {authRequire} = require('../middlewares/authRequire');
const {roleEnum, roleArray} = require('../utils/constants/userConstants');
const { findOneCategoriesByAnyDAO } = require('../controller.DAO/categoriesDAO');

routerProducts.post(
   '/admin/addProducts',
   authRequire([roleEnum.Admin]),
   uploadImage('image', './public/productImgs'),
   async (req, res, next) => {
      const product = req.body;
      const { file = null } = req;
      // get path of img uploaded
      let filePath = file?.path;
      if(file){
         const pathArr = filePath.split('\\');
         filePath = [process.env.BASE_URL,...pathArr.slice(1)].join('/');
         req.body.image = filePath;
         product.image = filePath;
      }
      try {
         const isValid = await validateData(addProductsSchema, product);
         if(isValid) {   
            next();
         }
         else {
            if(file) removeFileAsync(file.path);
            res.status(500).json('Lỗi không xác định!');
         }
      } catch (error) {
         if(file) removeFileAsync(file.path);
         next(error);
      }
   },
   async (req, res) => {
      const product = req.body;
      const {file = null} = req;
      const { category:cateID } = product;
      try {
         const categoryExist = await findOneCategoriesByAnyDAO({_id: cateID});

         if(!categoryExist) {
            const badRequest = httpErrors.BadRequest('Category is invalid!');
            if(file) removeFileAsync(file.path);
            res.status(badRequest.status).json(badRequest.message);
            return;
         }
         const productAdded = await addProductsDAO(product);
         res.json(productAdded);
      } catch (error) {
         if(file) removeFileAsync(file.path);
         res.status(500).json(error.message);
      }
   }
);

routerProducts.get(
   '/getProducts',
   authRequire(roleArray),
   async (req, res) => {
      const {limit = null, skip = null } = req.query;
      try {
         // url not exist limit and skip
         if(!limit && !skip){
            const products = await getProductsDAO(null, null);
            res.json(products);
            return;
         }
         // url not exist limit 
         if(!limit && skip > 0){
            const products = await getProductsDAO(null, skip);
            if(products) {
               const amount = await getCountProductsDAO();
               res.json({products,amount});
               return;
            } else {
               res.status(400).json('Lỗi không xác định!');
               return;
            }
         }
         // url exist limit and skip
         if(limit > 0 && skip >= 0){
            const products = await getProductsDAO(limit, skip);
            if(products) {
               const amount = await getCountProductsDAO();
               res.json({products,amount});
               return;
            } else {
               res.status(500).json('Lỗi không xác định!');
               return;
            }
         } else{
            const badRequestURL = httpErrors.BadRequest('Params invalid!');
            res.status(badRequestURL.status).json(badRequestURL.message);
            return;
         }
      } catch (error) {
         console.log(error);
         res.status(500).json('Lỗi server!');
      }
   }
);

routerProducts.get(
   '/searchProducts',
   // authRequire(roleArray),
   async (req, res) => {
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      try {
         const {name = null} = req.query;
         if(!name || name === ''){
            res.status(badRequestURL.status).json(badRequestURL.message);
            return;
         }
         const products = await searchProductsDAO(name);
         res.json(products);
      } catch (error) {
         res.status(500).json('Lỗi server!');
         return;
      }
   }
);

module.exports = routerProducts;