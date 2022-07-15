const express = require('express');
const routerCategories = express.Router();
const { validateData } = require('../../validates/validate');
const { addCategorySchema, updateCategorySchema } = require('../../validates/categorySchema');
const httpErrors = require('../../helpers/httpErrors');
const {
   addCategoryDAO,
   getCountCategoriesDAO,
   getCategoriesDAO,
   searchCategoriesDAO
} = require('../../controller.DAO/categoriesDAO');
const { authRequire } = require('../../middlewares/authRequire');
const { roleEnum, roleArray, pathImageEnum } = require('../../utils/constants/userConstants');
const Categories = require('../../models/categories.model');
const { uploadImage } = require('../../middlewares/uploadImage');
const { removeFileAsync } = require('../../helpers/processFile');

routerCategories.post(
   '/addCategories',
   authRequire([roleEnum.Admin]),
   uploadImage('avatarOfCate', pathImageEnum.avatarOfCatePath),
   async (req, res, next) => {
      const category = req.body;
      const { file } = req;
      try {
         // get path of img uploaded
         let filePath = file?.path;
         if (file) {
            const pathArr = filePath.split('\\');
            filePath = [process.env.BASE_URL, ...pathArr.slice(1)].join('/');
            req.body.avatarOfCate = filePath;
            category.avatarOfCate = filePath;
         }
         const result = await validateData(addCategorySchema, category);
         if (result) next();
         else {
            if (file) removeFileAsync(file.path);
            const badRequestData = httpErrors.BadRequest('Data is invalid!');
            res.status(badRequestData.status).json(badRequestData.message);
            return;
         }
      } catch (error) {
         if (file) removeFileAsync(file.path);
         next(error);
      }
   },
   async (req, res) => {
      const category = req.body;
      try {
         const cateSaved = await addCategoryDAO(category);
         if (cateSaved) {
            res.json(cateSaved);
            return;
         } else {
            res.status(500).json('Server internal error!');
            return;
         }
      } catch (error) {
         res.status(500).json('Lỗi không xác định!');
      }
   }
);

routerCategories.patch(
   '/updateCategories/:cateID',
   authRequire([roleEnum.Admin]),
   uploadImage('avatarOfCate', pathImageEnum.avatarOfCatePath),
   async (req, res, next) => {
      const category = req.body;
      const { file } = req;
      try {
         // get path of img uploaded
         let filePath = file?.path;
         if (file) {
            const pathArr = filePath.split('\\');
            filePath = [process.env.BASE_URL, ...pathArr.slice(1)].join('/');
            req.body.avatarOfCate = filePath;
            category.avatarOfCate = filePath;
         }
         const result = await validateData(updateCategorySchema, category);
         if (result) next();
         else {
            if (file) removeFileAsync(file.path);
            const badRequestData = httpErrors.BadRequest('Data is invalid!');
            res.status(badRequestData.status).json(badRequestData.message);
            return;
         }
      } catch (error) {
         if (file) removeFileAsync(file.path);
         next(error);
      }
   },
   async (req, res) => {
      const { cateID } = req.params;
      const categoryUpdate = req.body;
      const { file } = req;
      try {
         const oldCate = await Categories.findByIdAndUpdate(cateID, categoryUpdate).exec();
         if (!oldCate) {
            if (file) removeFileAsync(file.path);
            res.json({ status: false, type: 'error', message: 'Thất bại!' });
            return;
         }
         const { avatarOfCate } = oldCate;
         if (avatarOfCate && file) {
            const splitAvt = avatarOfCate.split('/');
            const oldPathAvt = pathImageEnum.avatarOfCatePath + splitAvt[splitAvt.length - 1];
            try {
               await removeFileAsync(oldPathAvt);
            } catch (error) {
               console.log(error);
            }
         }
         res.json({ status: true, type: 'success', message: 'Cập nhập thành công!' });
      } catch (error) {
         res.status(500).json(error.message);
      }
   }
);

routerCategories.get(
   '/getCategories',
   async (req, res) => {
      const { limit, skip, match } = req.query;
      const badRequestURL = httpErrors.BadRequest('Invalid URL!');
      if ((limit && isNaN(Number(limit))) || (skip && isNaN(Number(skip)))) {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      const objectQuery = { limit, skip, match };
      try {
         const categories = await getCategoriesDAO(objectQuery);
         const amountCate = await getCountCategoriesDAO();
         if(!match && (limit || skip)){
            res.json({ categories, amount: amountCate });
         }else{
            const {_id} = match || {};
            if(_id){
               res.json(categories[0]);
            } else{
               res.json(categories);
            }
         }
      } catch (error) {
         res.status(500).json(error.message);
      }
   }
)

routerCategories.get(
   '/searchCategories',
   authRequire(roleArray),
   async (req, res) => {
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      try {
         const { name = null } = req.query;
         if (!name || name === '') {
            res.status(badRequestURL.status).json(badRequestURL.message);
            return;
         }
         const categories = await searchCategoriesDAO(name);
         res.json(categories);
      } catch (error) {
         console.log(error);
         res.status(500).json('Lỗi server!');
         return;
      }
   }
);

routerCategories.delete(
   '/deleteCategory/:cateID',
   authRequire([roleEnum.Admin]),
   async (req, res) => {
      const { cateID } = req.params;
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      if (!cateID) {
         res.status(badRequestURL.status).json(badRequestURL.message);
         return;
      }
      try {
         const categoryDeleted = await Categories.findByIdAndDelete(cateID);
         if (categoryDeleted) {
            const { avatarOfCate } = categoryDeleted;
            if (avatarOfCate) {
               const splitAvt = avatarOfCate.split('/');
               const oldPathAvt = pathImageEnum.avatarOfCatePath + splitAvt[splitAvt.length - 1];
               try {
                  removeFileAsync(oldPathAvt);
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

module.exports = routerCategories;