//photoController.js
const multer = require('multer');
const Photo = require('../models/photoModel'); //get Photo model from /models/photoModel.js

// configure disk storage for files handled by multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/img');
  },
  filename: function (req, file, cb) {
   cb(null, file.originalname);

  // cb(null, Date.now() + "-" + file.originalname);
  }
});
// configure file extension filter for uploads
const imageFilter = function(req, file, cb) {
  if (file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
    cb(null, true);
  }  
  else {
    cb(new Error("OnlyImageFilesAllowed"), false);
 }
}
class PhotoService {
  static list(){
    return (Photo.find({}))
    .then((obj)=>{
      return obj;
    })
  }
}
module.exports.PhotoService = PhotoService;
module.exports.storage = storage;
module.exports.imageFilter = imageFilter;
