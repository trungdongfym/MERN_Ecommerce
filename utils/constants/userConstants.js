const methodLoginEnum = {
   normal: 'normal',
   google: 'google',
   facebook: 'facebook',
}

const roleEnum = {
   Admin: 'Admin',
   SaleStaff: 'SaleStaff',
   Custommer: 'Custommer'
}

const genderEnum = {
   male: 'Male',
   female: 'Female',
   other: 'Other',
   default: ''
}

const pathImageEnum = {
   avatarPath: './public/userAvatars/',
   productImagePath: './public/productImgs/',
   avatarOfCatePath: './public/categoriesAvatar/'
}

const roleArray = Object.values(roleEnum);
const methodLoginArray = Object.values(methodLoginEnum);
const genderArray = Object.values(genderEnum);

module.exports = {
   roleEnum,
   roleArray,
   methodLoginEnum,
   methodLoginArray,
   genderEnum,
   genderArray,
   pathImageEnum
}