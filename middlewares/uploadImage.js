const multer = require('multer');

function uploadImage(fieldName, destination) {
   const storage = multer.diskStorage({
      destination: function (req, file, cb) {
         cb(null, destination);
      },
      filename: function (req, file, cb) {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
         cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
      }
   });

   const upload = multer({
      storage: storage,
      limits: {
         fileSize: 1024 * 1024  //1MB
      },
      fileFilter: function (req, file, cb) {
         const fileTypes = /jpeg|jpg|png/;
         const mimeType = fileTypes.test(file.mimetype);
         if (mimeType) {
            cb(null, true);
            return;
         }
         cb(new Error('File is invalid!'), false);
      }
   }).single(fieldName);

   return (req, res, next) => {
      upload(req, res, function (err) {
         if (err instanceof multer.MulterError) {
            res.status(204).json('Upload file failure!');
            return;
         } else if (err) {
            next(err);
            return;
         }
         next();
      });
   }
}

module.exports = {
   uploadImage
}