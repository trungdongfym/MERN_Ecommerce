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

async function getProductsDAO(objectQuery) {
   let { limit, skip, requireCate, match, flashSale } = objectQuery;
   try {
      let queryProducts = null;
      if (flashSale) {
         match = {
            ...match,
            $and: [{ sale: { $exists: true } }, { sale: { $gt: 0 } }]
         }
      }
      if (match) {
         queryProducts = Products.find(match);
      } else {
         queryProducts = Products.find({});
      }
      if (skip) {
         queryProducts.skip(skip);
      }
      if (limit) {
         queryProducts.limit(limit);
      }
      if (requireCate) {
         queryProducts.populate({
            path: 'category',
         });
      }
      if (flashSale) {
         queryProducts.sort({ sale: -1 }); // sort sale desending
      }
      queryProducts.setOptions({ lean: true });
      const productsInStock = await queryProducts.exec();
      return productsInStock;
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
   getCountProductsDAO,
}