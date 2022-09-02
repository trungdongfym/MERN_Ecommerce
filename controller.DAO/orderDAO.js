const Orders = require('../models/orders.model');
const Cart = require('../models/cart.model');
const mongoose = require('mongoose');
const WareHouse = require('../models/warehouse.model');
const httpErrors = require('../helpers/httpErrors');
const { statusOrderEnum } = require('../utils/constants/orderConstants');

const orderTransactionDAO = async (newOrder) => {
   const session = await mongoose.startSession();
   try {
      session.startTransaction();
      const order = new Orders(newOrder);
      const orderSaved = await order.save({ session: session });
      const { user: userID, orderList } = newOrder;

      const productsOrder = await Promise.all(orderList.map(async (orderItem) => {
         const { product: productID, amount } = orderItem;
         // Update amount in warehouse
         const result = await WareHouse.updateOne(
            { products: productID, amount: { $gte: amount } },
            { $inc: { amount: -amount } },
            { session: session }
         );

         if (result.matchedCount !== 1 && result.modifiedCount !== 1) {
            throw httpErrors.ServerError(`Unable update amount in warehouse!`);
         }
         return productID;
      }));
      // Update cart
      const result = await Cart.updateOne({ user: userID }, {
         $pull: {
            listOrder: {
               product: {
                  $in: productsOrder
               }
            }
         }
      }, { session: session });
      // ------

      const leanOrder = orderSaved.toObject();
      await session.commitTransaction();
      await session.endSession();

      return leanOrder;
   } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
   }
}

const updateOrderDAO = async (orderId, orderUpdateData) => {
   const session = await mongoose.startSession();
   try {
      session.startTransaction();

      const orderUpdate = await Orders.findById(orderId);

      if (!orderUpdate) {
         throw httpErrors.NotFound('Không tìm thấy đơn hàng cập nhập!');
      }

      if (orderUpdate.statusOrder === statusOrderEnum.COMPLETE) {
         throw httpErrors.BadRequest(`Không thể cập nhập đơn hàng có trạng thái hoàn thành!`);
      }

      const { statusOrder } = orderUpdateData;

      if (statusOrder === statusOrderEnum.CANCELED) {
         if (
            orderUpdate.statusOrder !== statusOrderEnum.DELIVERY &&
            orderUpdate.statusOrder !== statusOrderEnum.PENDING
         ) {
            throw httpErrors.BadRequest(`Không thể hủy đơn hàng!`)
         }
      }
      // update order
      const orderUpdated = await Orders.findByIdAndUpdate(orderId, orderUpdateData, {
         session: session, new: true
      });

      if (statusOrder) {
         // Update amount in warehouse
         const orderList = orderUpdated.orderList ?? [];
         for (const orderItem of orderList) {
            const { product: productId, amount } = orderItem;
            // Check status order cancel or reorder is pending
            // If cancal then add amount to warehouse, otherwise subtract amount
            let amountApply = 0;
            if (statusOrder === statusOrderEnum.PENDING) {
               amountApply = -amount;
            } else if (statusOrder === statusOrderEnum.CANCELED) {
               amountApply = amount;
            }

            const result = await WareHouse.updateOne(
               { products: productId },
               { $inc: { amount: amountApply } },
               { session: session }
            );
            if (result.matchedCount !== 1 && result.modifiedCount !== 1) {
               throw httpErrors.ServerError('Không thể cập nhập số lượng trong kho!');
            }
         }
      }

      await session.commitTransaction();
      await session.endSession();

      return orderUpdated;
   } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
   }
}

const getOrderListDAO = async (queryParams, actor) => {
   const { _id: actorId } = actor;
   if (!actorId) {
      throw httpErrors.Unauthorized('Unauthorized!');
   }

   try {
      const { filter, search, pagination } = queryParams;
      const { status: statusOrder } = filter ?? {};
      let queryFilter = {
         user: actorId
      };
      const searchOrderByProduct = {
      }

      if (statusOrder && statusOrder !== 'all') {
         queryFilter = {
            ...queryFilter,
            statusOrder
         }
      }

      if (search) {
         if (mongoose.Types.ObjectId.isValid(search)) {
            queryFilter._id = new mongoose.Types.ObjectId(search);
         } else {
            searchOrderByProduct.$match = {
               orderList: {
                  $elemMatch: {
                     'product.name': new RegExp(search)
                  }
               }
            }
         }
      }

      const pipeConcat = [];

      if (Object.keys(searchOrderByProduct).length > 0) {
         pipeConcat.push(searchOrderByProduct);
      }

      const orderList = await Orders.aggregate([
         { $match: queryFilter },
         {
            $unwind: '$orderList'
         },
         {
            $lookup: {
               from: 'Products',
               localField: 'orderList.product',
               foreignField: '_id',
               as: 'orderList.product'
            }
         },
         {
            $unwind: '$orderList.product'
         },
         {
            $group: {
               _id: {
                  _id: '$_id',
               },
               orderList: {
                  $push: '$orderList'
               },
               root: {
                  $mergeObjects: '$$ROOT',
               }
            }
         },
         {
            $addFields: {
               'root.orderList': '$orderList'
            }
         },
         {
            $replaceRoot: { newRoot: '$root' }
         },
         ...pipeConcat
      ]);

      return orderList;
   } catch (error) {
      throw error;
   }
}

module.exports = {
   orderTransactionDAO,
   updateOrderDAO,
   getOrderListDAO
}