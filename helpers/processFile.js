const fs = require('fs')

async function removeFileAsync(filePath) {
   return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
         if (err) {
            reject(err);
         }
         resolve(filePath);
      })
   });
}

module.exports = {
   removeFileAsync
}