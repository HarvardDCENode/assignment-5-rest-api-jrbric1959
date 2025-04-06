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
class PhotoService { // operate on photos in Photo collection
  // return array of documents in model Photo
  static async list(){  // read all photos in Photo collection
    const photos = await Photo.find({});
    return photos;
  };
  static async update(id, data) {  // update photo(_id=id) with data
    const photo =  await Photo.findById(id);
    const newPhoto = photo.set(data);
    await photo.save();
    return newPhoto;
  };
  static async read(id) {  // find photo(_id=id) 
    const photo =  await Photo.findById(id);
    return photo;
  };
  static async delete(id) {  // delete photo(_id=id) 
    const photo =  await Photo.findOneAndDelete(id);
    return photo;
  };
  static async create(data){
  // create instance of Photo (schema=schema?, collection=photos_JB_A)
    const createdPhoto = new Photo();  
    createdPhoto.set(data);
    // save photo to collection=photos_JB_A with schema=schema?
    await createdPhoto.save();  
  };
}

module.exports.PhotoService = PhotoService;
module.exports.storage = storage;
module.exports.imageFilter = imageFilter;
