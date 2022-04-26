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

const roleArray = Object.values(roleEnum);
const methodLoginArray = Object.values(methodLoginEnum);

module.exports = {
   roleEnum,
   roleArray,
   methodLoginEnum,
   methodLoginArray
}