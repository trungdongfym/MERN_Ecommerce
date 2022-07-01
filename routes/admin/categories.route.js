const express = require('express');
const routerCategories = express.Router();
const { validateData } = require('../../validates/validate');
const {addCategorySchema} = require('../../validates/categorySchema');
const httpErrors = require('../../helpers/httpErrors');
const {
   addCategoryDAO, 
   getCountCategoriesDAO, 
   getCategoriesDAO,
   searchCategoriesDAO
} = require('../../controller.DAO/categoriesDAO');
const {authRequire} = require('../../middlewares/authRequire');
const {roleEnum, roleArray} = require('../../utils/constants/userConstants');

routerCategories.post(
   '/addCategories',
   authRequire([roleEnum.Admin]),
   async (req, res, next) => {
      const category = req.body;
      try {
         const result = await validateData(addCategorySchema,category);
         if(result) next();
         else {
            const badRequestData = httpErrors.BadRequest('Data is invalid!');
            res.status(badRequestData.status).json(badRequestData.message);
            return;
         }
      } catch (error) {
         next(error);
      }
   },
   async (req, res) => {
      const category = req.body;
      try {
         const cateSaved = await addCategoryDAO(category);
         if(cateSaved) {
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

routerCategories.get(
   '/getCategories',
   authRequire(roleArray),
   async (req, res) => {
      const {limit = null, skip = null } = req.query;
      try {
         // url not exist limit and skip
         if(!limit && !skip){
            const categories = await getCategoriesDAO(null, null);
            res.json(categories);
            return;
         }
         // url not exist limit 
         if(!limit && skip > 0){
            const categories = await getCategoriesDAO(null, skip);
            if(categories) {
               const amount = await getCountCategoriesDAO();
               res.json({categories,amount});
               return;
            } else {
               res.status(400).json('Lỗi không xác định!');
               return;
            }
         }
         // url exist limit and skip
         if(limit > 0 && skip >= 0){
            const categories = await getCategoriesDAO(limit, skip);
            if(categories) {
               const amount = await getCountCategoriesDAO();
               res.json({categories,amount});
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

routerCategories.get(
   '/searchCategories',
   // authRequire(roleArray),
   async (req, res) => {
      const badRequestURL = httpErrors.BadRequest('URL invalid!');
      try {
         const {name = null} = req.query;
         if(!name || name === ''){
            res.status(badRequestURL.status).json(badRequestURL.message);
            return;
         }
         const categories = await searchCategoriesDAO(name);
         res.json(categories);
      } catch (error) {
         res.status(500).json('Lỗi server!');
         return;
      }
   }
);

routerCategories.get(
   '/test',
   async (req, res) => {
      
      res.send('ok');
   }
)

module.exports = routerCategories;