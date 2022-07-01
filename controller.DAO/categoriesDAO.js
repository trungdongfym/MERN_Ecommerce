const Categories = require('../models/categories.model');

async function addCategoryDAO(category){
   try {
      const newCate = new Categories(category);
      const cateSaved = newCate.save();
      return cateSaved;
   } catch (error) {
      throw error;
   }
}

async function getCategoriesDAO(limit, skip){
   try {
      if(limit && skip) return await Categories.find({}).skip(skip).limit(limit).exec();
      if(skip) return await Categories.find({}).skip(skip).exec();
      return await Categories.find({}).exec();
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
      const categories = await Categories.find({
         name: { $regex: new RegExp(`.*${searchName}.*`,'im') }
      }).exec();
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
   if(typeof objectField !== 'object') return null;
   if(Object.keys(objectField).length <=0) return null;
   try {
      const categorie = await Categories.findOne({...objectField}).exec();
      return categorie;
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