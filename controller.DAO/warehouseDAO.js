const WareHouse = require('../models/warehouse.model');

const updateOneWarehouseDAO = async (filterObject, productsUpdateWarehouse, options) => {
   try {
      const result = await WareHouse.updateOne(filterObject, productsUpdateWarehouse, {
         ...options
      });
      return result;
   } catch (error) {
      throw error;
   }
}

const getWareHouseDAO = async (objectQuery) => {
   const { limit, skip, requireCate } = objectQuery;
   try {
      const queryProductsInStock = WareHouse.find({});
      if(skip){
         queryProductsInStock.skip(skip);
      }
      if(limit){
         queryProductsInStock.limit(limit);
      }
      if(requireCate){
         queryProductsInStock.populate({
            path: 'products',
            populate: {
               path: 'category'
            }
         });
         
      } else{
         queryProductsInStock.populate({
            path: 'products'
         });
      }
      const productsInStock = await queryProductsInStock.exec();
      return productsInStock;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   updateOneWarehouseDAO,
   getWareHouseDAO
}