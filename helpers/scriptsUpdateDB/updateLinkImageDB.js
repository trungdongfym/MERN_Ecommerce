const monngoose = require('mongoose');
const Users = require('../../models/users.model');
const Products = require('../../models/products.model');
const { methodLoginEnum } = require('../../utils/constants/userConstants');
const mongoDBConnect = require('../DBConnect/mongoConnect');
const Categories = require('../../models/categories.model');

const baseURL = 'https://ecommercefym.herokuapp.com/';
const localBaseUrl = 'http://localhost:5000/'
const dbUrl = 'mongodb+srv://trungdong:Trungdong1@ecommerce.ad8cyke.mongodb.net/ecommerce';

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

async function updateLinkImgCategories(baseURL) {
   try {
      const categories = await Categories.find({ avatarOfCate: { $exists: true } });
      categories.map(async (category) => {
         const { avatarOfCate, _id } = category;
         if (avatarOfCate === '') return;
         const avatarSplit = avatarOfCate.split('/');
         const newAvatarUrl = baseURL + avatarSplit.slice(-2, avatarSplit.length).join('/');
         await Categories.updateOne({ _id: _id }, { avatarOfCate: newAvatarUrl });
      });
      console.log('Update successfully!');
   } catch (error) {
      console.log(error);
   }
}

// updateLinkImgUsers(baseURL);
// updateLinkImgProducts(baseURL);
updateLinkImgCategories(baseURL);