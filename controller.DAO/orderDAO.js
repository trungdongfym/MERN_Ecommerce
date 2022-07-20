const Orders = require('../models/orders.model');
const Cart = require('../models/cart.model');
const mongoose = require('mongoose');

const orderTransactionDAO = async (newOrder) => {
   const session = await mongoose.startSession();
   try {
      session.startTransaction();
      const order = new Orders(newOrder);
      const orderSaved = await order.save({ session: session });
      const { user: userID, orderList } = newOrder;

      const productsOrder = orderList.map((orderItem) => {
         const { product: productID } = orderItem;
         return productID;
      });

      const result = await Cart.updateOne({ user: userID }, {
         $pull: {
            listOrder: {
               product: {
                  $in: productsOrder
               }
            }
         }
      }, { session: session });
      if (result.modifiedCount === 0) {
         await session.abortTransaction();
         await session.endSession();
         return null;
      }
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

module.exports = {
   orderTransactionDAO
}