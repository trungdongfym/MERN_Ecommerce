const path = require('path')
module.exports = (modelName) => {
   const modelPath = path.join(__dirname, modelName);
   return require(modelPath);
}