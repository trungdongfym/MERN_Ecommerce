const Products = require('../models/products.model');
const ImportProducts = require('../models/importProducts.model');
const DetailImportProducts = require('../models/detailImportProducts.model');
const mongoose = require('mongoose');
const { importProductStatusEnum } = require('../utils/constants/productsConstants');
const WareHouse = require('../models/warehouse.model');

const importProductsTransactionDAO = async (importProduct) => {
   let { detailImportProducts } = importProduct;
   delete importProduct.detailImportProducts;
   const session = await mongoose.startSession();
   try {
      session.startTransaction();
      const newImportProduct = new ImportProducts(importProduct);
      const importProductAdded = await newImportProduct.save({ session });
      const { _id: importProductsId = null } = importProductAdded;

      if (!importProductsId) {
         await session.abortTransaction();
         session.endSession();
         return null;
      }
      // add id of importProducts
      detailImportProducts = detailImportProducts.map((detailImportProduct) => {
         return { ...detailImportProduct, importProducts: importProductsId };
      });
      const detailImportProductsAdded = await DetailImportProducts.insertMany(detailImportProducts, {
         session: session
      });
      await session.commitTransaction();
      session.endSession();
      return { ...importProductAdded._doc, detailImportProducts: detailImportProductsAdded };
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
}

const getImportProductsDAO = async (requireObject) => {
   const { requireUser = null, requireProducts = null, limit, skip, match } = requireObject || {};

   // for normal query
   let normalQuery = [];
   if (!requireProducts && !requireUser) {
      normalQuery = [
         {
            $project: { // compute into Money for a import product
               document: "$$ROOT",
               importProductsArr: {
                  $map: {
                     input: '$detailImportProducts',
                     as: 'product',
                     in: {
                        $mergeObjects: [
                           "$$product",
                           {
                              intoMoney: {
                                 $multiply: ['$$product.amount', '$$product.price']
                              }
                           }
                        ]
                     }
                  }
               }
            }
         },
         {
            $addFields: { // get field  totalMoney 
               totalMoney: { $sum: "$importProductsArr.intoMoney" }
            }
         },
         {
            $replaceRoot: { newRoot: { $mergeObjects: ['$document', { totalMoney: '$totalMoney' }] } }
         },
         {
            $unset: ["detailImportProducts"]
         },
      ]
   }
   // for populate user
   const userQuery = requireUser ? [
      {
         $lookup: {
            from: 'Users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
         }
      },
      {
         $unwind: "$user"
      },
      {
         $project: {
            "user.password": 0,
            "user.methodLogin": 0,
            "user.dateOfBirth": 0
         }
      }
   ] : [];

   // for pagenation
   const limitRequired = limit ? [{
      $limit: +limit
   }] : [];

   const skipRequired = skip ? [{
      $skip: +skip
   }] : [];

   // For filter
   let matchRequire = [];
   if (match) {
      const { _id, textSearch } = match;
      if (_id) match._id = mongoose.Types.ObjectId(_id);
      if (textSearch) {
         delete match.textSearch;
         matchRequire = [
            {
               $match: {
                  $text: {
                     $search: textSearch
                  },
                  ...match
               },
            }
         ]
      } else {
         matchRequire = [
            {
               $match: match
            }
         ]
      }
   }

   try {
      let importProducts = await ImportProducts.aggregate([
         ...matchRequire,
         ...skipRequired,
         ...limitRequired,
         {
            $lookup: {
               from: 'DetailImportProducts',
               localField: '_id',
               foreignField: 'importProducts',
               as: 'detailImportProducts'
            },
         },
         ...userQuery,
         ...normalQuery,
      ]).exec();

      if (requireProducts) {
         // map array of import products
         importProducts = importProducts.map(async (importProduct) => {
            let { detailImportProducts } = importProduct;
            // map detail import product
            detailImportProducts = detailImportProducts.map(async (productImportInfo) => {
               const { products: productID } = productImportInfo;
               try {
                  const product = await Products.findById(productID, { _id: 1, name: 1, image: 1 }).exec();
                  productImportInfo.products = product;
                  return productImportInfo;
               } catch (error) {
                  productImportInfo.products = null;
                  throw error;
               }
            });
            detailImportProducts = await Promise.all(detailImportProducts);
            importProduct.detailImportProducts = detailImportProducts;
            return importProduct;
         });
         importProducts = await Promise.all(importProducts);
      }
      // console.log(importProducts);
      return importProducts;
   } catch (error) {
      throw error;
   }
}

const updateImportProductsTransactionDAO = async (importProductUpdate, importID) => {
   const { detailImportProducts, status } = importProductUpdate;
   const session = await mongoose.startSession();
   try {
      session.startTransaction();
      const { matchedCount } = await ImportProducts.updateOne({ _id: importID }, importProductUpdate, {
         returnDocument: true,
         session: session
      });
      if (matchedCount > 0) {
         if (status === importProductStatusEnum.Completed) {
            for (const detailImportProduct of detailImportProducts) {
               const { products: productID, amount } = detailImportProduct;
               await WareHouse.updateOne({ products: productID }, {
                  products: productID,
                  $inc: { "amount": amount },
               }, {
                  session: session,
                  upsert: true,
               });
            }
         }
         await session.commitTransaction();
         await session.endSession;
         return true;
      } else {
         return false;
      }
   } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
   }
}

const deleteImportProductDAO = async (importProductID) => {
   const session = await mongoose.startSession();
   try {
      session.startTransaction();
      const statusDeleteImport = await ImportProducts.deleteOne({ _id: importProductID }, {
         session: session
      });
      const statusDeleteDetailImport = await DetailImportProducts.deleteMany({
         importProducts: importProductID
      }, { session: session });
      if (statusDeleteImport.deletedCount !== 1 || statusDeleteDetailImport.deletedCount === 0) {
         await session.abortTransaction();
         await session.endSession();
         return false;
      }
      await session.commitTransaction();
      await session.endSession();
      return true;
   } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      return false;
   }
}

module.exports = {
   importProductsTransactionDAO,
   getImportProductsDAO,
   updateImportProductsTransactionDAO,
   deleteImportProductDAO
}