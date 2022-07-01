const Products = require('../models/products.model');

const addProductsDAO = async (product) => {
   try {
      const newProduct = new Products(product);
      const productAdded = newProduct.save();
      return productAdded;
   } catch (error) {
      throw error;
   }
}

async function getProductsDAO(limit, skip) {
   try {
      if (limit && skip) return await Products.find({}).skip(skip).limit(limit).populate('category').exec();
      if (skip) return await Products.find({}).skip(skip).populate('category').exec();
      return await Products.find({}).populate('category').exec();
   } catch (error) {
      throw error;
   }
}

const getCountProductsDAO = async () => {
   try {
      const count = await Products.find({}).count();
      return count;
   } catch (error) {
      throw error;
   }
}

const searchProductsDAO = async (searchName) => {
   try {
      const product = await Products.aggregate([
         {
            $lookup: {
               from: 'Categories',
               localField: 'category',
               foreignField: '_id',
               as: 'category'
            }
         },
         { $unwind: '$category' },
         { $project: { createdAt: 0, updatedAt: 0 } },
         {
            $match: {
               $or: [
                  { name: { $regex: new RegExp(`.*${searchName}.*`, 'im') } },
                  { 'category.name': { $regex: new RegExp(`.*${searchName}.*`, 'im') } }
               ]
            }
         }
      ]).exec();
      return product;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   addProductsDAO,
   searchProductsDAO,
   getProductsDAO,
   getCountProductsDAO
}