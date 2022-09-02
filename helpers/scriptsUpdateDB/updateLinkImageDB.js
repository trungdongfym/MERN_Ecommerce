const monngoose = require('mongoose');
const Users = require('../../models/users.model');
const Products = require('../../models/products.model');
const { methodLoginEnum } = require('../../utils/constants/userConstants');
const mongoDBConnect = require('../DBConnect/mongoConnect');

const baseURL = 'http://18.217.35.165:8080/';
const localBaseUrl = 'http://localhost:5000/'
const dbUrl = 'mongodb://localhost:27017/ecommerce';

mongoDBConnect(dbUrl);

async function updateLinkImgUsers(baseURL) {
   try {
      const users = await Users.find({ avatar: { $exists: true }, methodLogin: methodLoginEnum.normal });
      users.map(async (user) => {
         const { avatar, _id } = user;
         if (avatar === '') return;
         const avatarSplit = avatar.split('/');
         const newAvatarUrl = baseURL + avatarSplit.slice(-2, avatarSplit.length).join('/');
         await Users.updateOne({ _id: _id }, { avatar: newAvatarUrl });
      });
      console.log('Update successfully!');
   } catch (error) {
      console.log(error);
   }
}

async function updateLinkImgProducts(baseURL) {
   try {
      const products = await Products.find({ image: { $exists: true } });
      products.map(async (product) => {
         const { image, _id } = product;
         if (image === '') return;
         const avatarSplit = image.split('/');
         const newAvatarUrl = baseURL + avatarSplit.slice(-2, avatarSplit.length).join('/');
         await Products.updateOne({ _id: _id }, { image: newAvatarUrl });
      });
      console.log('Update successfully!');
   } catch (error) {
      console.log(error);
   }
}

updateLinkImgUsers(localBaseUrl);
// updateLinkImgProducts(localBaseUrl);