const { default: mongoose } = require('mongoose');
const Orders = require('../models/orders.model');
const Products = require('../models/products.model');
const { statusOrderEnum } = require('../utils/constants/orderConstants');

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
      queryProducts.populate({
         path: 'warehouse',
         select: 'amount'
      });

      if (flashSale) {
         queryProducts.sort({ sale: -1 }); // sort sale desending
      }
      queryProducts.setOptions({ lean: true });
      const productsInStock = await queryProducts.exec();

      return productsInStock;
   } catch (error) {
      console.log(error);
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

const listProductDAO = async (queryProducts) => {
   try {
      const { search, filter = {}, sort, pagination } = queryProducts;

      const { page, pageSize } = pagination ?? {};
      const { price, cateId } = filter ?? {};
      const { minPrice, maxPrice } = price ?? {};
      const { bestsell } = sort ?? {};

      price && delete filter.price;

      // create filter query
      if (cateId) {
         delete filter.cateId;
      }
      const filterPipe = {
         $match: {
            ...filter
         }
      }

      if (price) {
         filterPipe.$match = {
            ...filterPipe.$match,
            $and: [
               { price: { $gte: minPrice } },
               { price: { $lte: maxPrice } }
            ]
         }
      }

      if (search && search !== '') {
         filterPipe.$match = {
            ...filterPipe.$match,
            $text: {
               $search: search
            },
         }
      }
      // Create pagination
      const skipPipe = {};
      const limitPipe = {};
      if (typeof page === 'number' && typeof pageSize === 'number') {
         skipPipe.$skip = page * pageSize;
         limitPipe.$limit = pageSize;
      }
      // Create sort pipe
      const sortPipe = { $sort: { _id: 1 } }; //default is lastest
      if (typeof bestsell === 'number') {
         delete sort.bestsell;
      }

      if (sort && Object.keys(sort).length > 0) {
         sortPipe.$sort = sort;
      }
      // Create lookup
      const lookupCatePipe = {
         $lookup: {
            from: 'Categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
         }
      }

      if (cateId) {
         lookupCatePipe.$lookup.pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(cateId) } },
            { $project: { _id: 1, name: 1, avatarOfCate: 1 } }
         ]
      }

      const lookupWareHousePipe = {
         $lookup: {
            from: 'WareHouse',
            localField: '_id',
            pipeline: [
               { $project: { _id: 0, amount: 1 } }
            ],
            foreignField: 'products',
            as: 'warehouse'
         }
      }
      // --------
      // Create pipe aggregate
      const pipe = [];
      if (Object.keys(filterPipe).length > 0) pipe.push(filterPipe);
      if (Object.keys(lookupCatePipe).length > 0) pipe.push(lookupCatePipe);
      if (Object.keys(lookupWareHousePipe).length > 0) pipe.push(lookupWareHousePipe);
      if (Object.keys(sortPipe).length > 0) pipe.push(sortPipe);

      pipe.push({ $unwind: '$category' });
      pipe.push({ $addFields: { amount: 0 } });
      pipe.push({ $project: { root: "$$ROOT", warehouse: { $arrayElemAt: ["$warehouse", 0] } } });
      pipe.push({ $replaceRoot: { newRoot: { $mergeObjects: ['$root', '$warehouse'] } } });
      pipe.push({ $project: { warehouse: 0 } });

      let isFacet = false;
      if (Object.keys(skipPipe).length > 0 && Object.keys(limitPipe).length > 0 && !bestsell) {
         const facetPipe = {
            $facet: {
               count: [{ $count: 'count' }],
               data: [skipPipe, limitPipe]
            }
         }
         pipe.push(facetPipe);
         isFacet = true;
      }
      // -------

      const productsDataAggregate = await Products.aggregate(pipe);

      let products = productsDataAggregate;
      let count = 0;
      if (isFacet) {
         if (products.length > 0) {
            const { count: quantityProduct, data } = products[0];
            products = data;
            count = quantityProduct[0]?.count;
         }
      }

      const countSellProducts = await Orders.aggregate([
         {
            $match: {
               statusOrder: { $ne: statusOrderEnum.CANCELED }
            }
         },
         { $unwind: '$orderList' },
         {
            $group: {
               _id: '$orderList.product',
               sellNumber: {
                  $count: {}
               }
            },
         }
      ]);
      // add sellnumber field
      products.map((product) => {
         const { _id: productId } = product;
         const numproductSell = countSellProducts.find((value) => {
            return value._id.equals(productId);
         });
         product.sellNumber = numproductSell?.sellNumber ?? 0;
      });

      if (typeof bestsell === 'number') {
         products.sort((productA, productB) => {
            return (productA.sellNumber - productB.sellNumber) * bestsell;
         });
      }

      if (!isFacet && bestsell) {
         count = products.length;
         products = products.slice(page * pageSize, (page + 1) * pageSize);
         isFacet = true;
      }

      if (isFacet) {
         return { count, products }
      } else {
         return products;
      }
   } catch (error) {
      throw error;
   }
}

module.exports = {
   addProductsDAO,
   searchProductsDAO,
   getProductsDAO,
   getCountProductsDAO,
   listProductDAO
}