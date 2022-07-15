const { default: mongoose } = require('mongoose');
const Categories = require('../models/categories.model');

async function addCategoryDAO(category) {
   try {
      const newCate = new Categories(category);
      const cateSaved = newCate.save();
      return cateSaved;
   } catch (error) {
      throw error;
   }
}

async function getCategoriesDAO(objectQuery) {
   const { limit, skip, match } = objectQuery;
   try {
      // for pagenation
      const limitRequired = limit ? [{
         $limit: +limit
      }] : [];

      const skipRequired = skip ? [{
         $skip: +skip
      }] : [];

      let matchRequired = [];
      if (match) {
         const { _id, ...otherField } = match;
         if(_id){
            matchRequired = [{
               $match: {
                  _id: mongoose.Types.ObjectId(_id),
                  ...otherField
               }
            }]
         } else{
            matchRequired = [{
               $match: match
            }]
         }
      }
      const categories = await Categories.aggregate([
         ...matchRequired,
         ...skipRequired,
         ...limitRequired,
         {
            $lookup: {
               from: 'Products',
               localField: '_id',
               foreignField: 'category',
               as: 'products'
            }
         },
         {
            $addFields: {
               totalProducts: {
                  $size: '$products'
               }
            }
         },
         {
            $unset: 'products'
         }
      ]);
      return categories;
   } catch (error) {
      throw error;
   }
}

const getCountCategoriesDAO = async () => {
   try {
      const count = await Categories.find({}).count();
      return count;
   } catch (error) {
      throw error;
   }
}

const searchCategoriesDAO = async (searchName) => {
   try {
      // const categories = await Categories.find({
      //    name: { $regex: new RegExp(`.*${searchName}.*`,'im') }
      // }).exec();
      const categories = await Categories.aggregate([
         {
            $match: {
               name: new RegExp(`.*${searchName}.*`, 'im')
            }
         },
         {
            $lookup: {
               from: 'Products',
               localField: '_id',
               foreignField: 'category',
               as: 'products'
            }
         },
         {
            $addFields: {
               totalProducts: {
                  $size: '$products'
               }
            }
         },
         {
            $unset: 'products'
         }
      ]);
      // Test fulltext search
      // const categories = await Categories.find({ 
      //    $text: {$search: searchName}
      // }).exec();
      return categories;
   } catch (error) {
      throw error;
   }
}

const findOneCategoriesByAnyDAO = async (objectField) => {
   if (typeof objectField !== 'object') return null;
   if (Object.keys(objectField).length <= 0) return null;
   try {
      const categories = await Categories.findOne({ ...objectField }).exec();
      return categories;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   addCategoryDAO,
   getCategoriesDAO,
   getCountCategoriesDAO,
   searchCategoriesDAO,
   findOneCategoriesByAnyDAO
}