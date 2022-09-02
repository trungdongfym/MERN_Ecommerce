const express = require('express');
const routerProducts = express.Router();
const { addProductsSchema, validateData, updateProductsSchema, queryProductSchema } = require('../validates');
const { uploadImage } = require('../middlewares/uploadImage');
const { removeFileAsync } = require('../helpers/processFile');
const httpErrors = require('../helpers/httpErrors');
const {
   addProductsDAO, getCountProductsDAO,
   getProductsDAO, searchProductsDAO, listProductDAO
} = require('../controller.DAO/productsDAO');
const { authRequire } = require('../middlewares/authRequire');
const { roleEnum, roleArray, pathImageEnum } = require('../utils/constants/userConstants');
const { findOneCategoriesByAnyDAO } = require('../controller.DAO/categoriesDAO');
const ImportProducts = require('../models/importProducts.model');
const { importProductsTransactionDAO, getImportProductsDAO } = require('../controller.DAO/importProductsDAO');
const Products = require('../models/products.model');
const { default: mongoose } = require('mongoose');

routerProducts.post(
   '/admin/addProducts',
   authRequire([roleEnum.Admin]),
   uploadImage('image', './public/productImgs'),
   async (req, res, next) => {
      const product = req.body;
      const { file = null } = req;
      // get path of img uploaded
      let filePath = file?.path;
      if (file) {
         const pathArr = filePath.split('\\');
         filePath = [process.env.BASE_URL, ...pathArr.slice(1)].join('/');
         req.body.image = filePath;
         product.image = filePath;
      }
      try {
         const isValid = await validateData(addProductsSchema, product);
         if (isValid) {
            next();
         }
         else {
            if (file) removeFileAsync(file.path);
            res.status(500).json('Lỗi không xác định!');
         }
      } catch (error) {
         if (file) removeFileAsync(file.path);
         next(error);
      }
   },
   async (req, res) => {
      const product = req.body;
      const { file = null } = req;
      const { category: cateID } = product;
      try {
         const categoryExist = await findOneCategoriesByAnyDAO({ _id: cateID });

         if (!categoryExist) {
            const badRequest = httpErrors.BadRequest('Category is invalid!');
            if (file) removeFileAsync(file.path);
            res.status(badRequest.status).json(badRequest.message);
            return;
         }
         const productAdded = await addProductsDAO(product);
         res.json(productAdded);
      } catch (error) {
         if (file) removeFileAsync(file.path);
         res.status(500).json(error.message);
      }
   }
);

routerProducts.get(
   '/getProducts',
   async (req, res) => {
      const { limit, skip, requireCate, match, flashSale } = req.query;
      const objectQuery = { limit, skip, requireCate, match, flashSale };
      try {
         const products = await getProductsDAO(objectQuery);

         if (match && match?._id) {
            res.json({ ...products[0] });
         } else if (limit && skip && !match) {
            const amount = await getCountProductsDAO();
            res.json({ products, amount });
         } else {
            res.json(products);
         }
      } catch (error) {
         res.status(500).json('Lỗi server!');
      }
   }
);

routerProducts.get('/products',
   async (req, res, next) => {
      try {
         const queryData = req.query;
         const dataValidate = await validateData(queryProductSchema, queryData);
         if (dataValidate) {
            req.query = dataValidate;
            next();
         }
         else {
            res.status(500).json('Lỗi không xác định!');
         }
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const queryProduct = req.query;
      try {
         const queryProductClone = JSON.parse(JSON.stringify(queryProduct));
         const dataProducts = await listProductDAO(queryProduct) ?? [];
         res.json({
            data: dataProducts,
            meta: queryProductClone
         });
      } catch (error) {
         res.status(500).json(error?.message || 'Unknow errors!');
      }
   }
);

routerProducts.get(
   '/searchProducts',
   authRequire(roleArray),
   async (req, res) => {
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      try {
         const { name = null } = req.query;
         if (!name || name === '') {
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

routerProducts.get(
   '/getRelateProducts',
   async (req, res) => {
      const { productID } = req.query;
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      if (!productID || productID === '') {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      try {
         const product = await Products.findById(productID).populate('category').setOptions({
            lean: true
         });
         if (!product) {
            res.status(badRequestURL.status).json(badRequestURL.message);
            return;
         }
         const { name: nameProduct, category } = product || {};
         const { name: nameCate } = category || {};
         const productRelate = await Products.aggregate([
            {
               $match: {
                  _id: {
                     $ne: mongoose.Types.ObjectId(productID)
                  },
                  $text: {
                     $search: nameProduct
                  }
               },
            },
            { $sort: { score: { $meta: "textScore" } } },
         ]);
         res.json(productRelate);
      } catch (error) {
         res.status(500).json(error.message);
      }
   }
);

routerProducts.patch(
   '/admin/updateProducts/:productID',
   authRequire([roleEnum.Admin]),
   uploadImage('image', './public/productImgs'),
   async (req, res, next) => {
      const product = req.body;
      const { file = null } = req;
      // get path of img uploaded
      let filePath = file?.path;
      if (file) {
         const pathArr = filePath.split('\\');
         filePath = [process.env.BASE_URL, ...pathArr.slice(1)].join('/');
         req.body.image = filePath;
         product.image = filePath;
      }
      try {
         const isValid = await validateData(updateProductsSchema, product);
         if (isValid) {
            next();
         }
         else {
            if (file) removeFileAsync(file.path);
            res.status(500).json('Lỗi không xác định!');
         }
      } catch (error) {
         console.log(error);
         if (file) removeFileAsync(file.path);
         next(error);
      }
   },
   async (req, res) => {
      const { productID } = req.params;
      const productUpdate = req.body;
      const { file } = req;
      const { category: cateID } = productUpdate || {};

      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      if (!productID) {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      try {
         // Check category
         if (cateID) {
            const categoryExist = await findOneCategoriesByAnyDAO({ _id: cateID });
            if (!categoryExist) {
               const badRequest = httpErrors.BadRequest('Category is invalid!');
               if (file) removeFileAsync(file.path);
               res.status(badRequest.status).json(badRequest.message);
               return;
            }
         }
         const { modifiedCount } = await Products.updateOne({ _id: productID }, productUpdate, {
            runValidators: true
         });
         if (modifiedCount !== 1) {
            if (file) removeFileAsync(file.path);
            res.json({ status: false });
            return;
         }
         res.json({ status: true });
      } catch (error) {
         console.log(error);
         res.status(500).json(error.message);
      }
   }
);

routerProducts.delete(
   '/admin/deleteProduct/:productID',
   authRequire([roleEnum.Admin]),
   async (req, res) => {
      const { productID } = req.params;
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      if (!productID) {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      try {
         const result = await Products.findByIdAndDelete({ _id: productID });
         if (result) {
            const { image } = result;
            if (image !== '') {
               try {
                  const imageSplit = image.split('/');
                  const oldImage = pathImageEnum.productImagePath + imageSplit[imageSplit.length - 1];
                  await removeFileAsync(oldImage);
               } catch (error) {
                  console.log(error);
               }
            }
            res.json({ status: true });
            return;
         } else {
            res.json({ status: false });
            return;
         }
      } catch (error) {
         res.status(500).json('Server internal error!');
      }
   }
);

module.exports = routerProducts;