//photos.js

const express = require('express'); // load express
const router = express.Router(); // create router for routing
const multer = require('multer'); // handle file uploads
const flash = require('express-flash');// support flash messages
const Photo = require('../models/photoModel'); // model for photo metadata
const photoController = require('../controllers/photoController');
const upload = multer({
  //instance of multer to specify dest/filename of uploaded photos
  storage: photoController.storage, //pass storage object to multer
  fileFilter: photoController.imageFilter // pass fileFilter object to multer
});
const PhotoService = photoController.PhotoService;
//----------------------------------------------------------------------------------
router.use(flash());// configure flash messaging middleware
//----------------------------------------------------------------------------------
// List all photos
router.get('/', async (req, res, next)=>{
  try {
    const photos = await PhotoService.list(); // find and assign all docs in Photo collection to photos
    console.log("\n photos.js LINE 22: photos = ", photos, "\n"); 
    res.render('photos', { //render photos.pug to show all photos
      photos : photos,
      flashFileUploadError: req.flash("fileUploadError"),  
      flashNoFileSelected: req.flash("noFileSelected")
    });
  }
  catch(err) {
    console.error(err);
    res.status(500).send("Error displaying photos");
  }
});
//----------------------------------------------------------------------------------
// Retrieve photo document with _id=photoid 
// Render updatePhoto.pug, pass in all photo docs and flash property for "photoFindError
router.get('/:photoid', async (req, res, next)=>{ //handle get request from URL with path /photos/photoid
  try {
  console.log("finding "+req.params.photoid);
  console.log("\n photos.js LINE 37: req.params = ", req.params, "\n");
  const photo = await PhotoService.read(req.params.photoid) // find document with _id=photoid
    res.render('updatePhoto', { // render page with form to update metadata of photo
      photo: photo, // pass in all photo documents
      flashPhotoFindError: req.flash("photoFindError"), // pass in flash property for "photoFindError"
    });
  }
  catch(err){ // if error encountered finding photo
    console.log(err);
  };
});
//----------------------------------------------------------------------------------
// UPDATE METADATA OF PHOTO
router.post('/:photoid', async (req, res, next) => {
  try {
    // get Photo object with _id=photoid and assign to photo
    const data = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      year: req.body.year,
      occasion: req.body.occasion
    };
    // Update the Photo object to the collection
    await PhotoService.update(req.params.photoid, data); 
    res.redirect('/photos'); // Redirect to the photos list after updating
  } 
  catch (err) {
    console.error("Problem updating photo:", err); // Logs the actual error
    next(err); // Passes the error to Express error handling middleware
  }
});
//----------------------------------------------------------------------------------
// Add comment to selected photo
router.post('/commentArray/:photoid', async (req, res, next) => {
  try {
    console.log("photos.js LINE 77: req.body.comment_text =", req.body.comment_text);
    console.log("photos.js LINE 78: req.params =", req.params);
    // Find the photo from photoid
    const singleFoundPhoto = await PhotoService.read(req.params.photoid);
    console.log("photos.js LINE 82: singleFoundPhoto =", singleFoundPhoto);
    if (!singleFoundPhoto) {  // if photo not found return error message
      console.log("photos.js LINE 85: Photo not found.");
      return res.status(404).send('Photo not found');
    }
    const newComment = {  // Prepare the comment data
      name: req.body.name,
      date_time: req.body.date_time,
      comment_text: req.body.comment_text
    }
    console.log("photos.js LINE 91: commentArray = ", newComment);
    // Get commentArray from singleFoundPhoto
    let commentArray = singleFoundPhoto.commentArray;
    console.log("photos.js LINE 95: commentArray = ", commentArray);
    //push newComment onto commentArray in selected photo
     
    singleFoundPhoto.commentArray.push(newComment);
    commentArray = singleFoundPhoto.commentArray

    const data = {commentArray: commentArray }

    //update selected photo
    console.log("photos.js LINE 113: data = ", data);
    const updatedPhoto = await PhotoService.update(req.params.photoid, data);
    console.log("photos.js LINE 115: updatedPhoto = ", updatedPhoto);
    res.redirect('/photos');
  } 
  catch (err) {
    console.error("photos.js LINE 106: Error adding comment:", err);
    next(err); // Pass the error to Express error handler
  }
});
//----------------------------------------------------------------------------------
// GET addCommentForm.pug to specify new comment to be added to selected photo
router.get('/addCommentForm/:photoid', async (req, res, next) => {
  try {    
    res.render('addCommentForm.pug', {  // render addCommentForm
      photoid: req.params.photoid    // pass in photoid
      // photo: singleFoundPhoto         // pass in selected photo
    });
  } 
  catch (error) {
    console.error('Error found while adding comment:', error);
    next(error); // Pass the error to the Express error handler
  }
});
//----------------------------------------------------------------------------------
// Delete photo with _id=photoid
router.get('/delete/:photoid', async (req, res, next)=>{// Delete a picture 
  console.log("photos.js LINE 91:  Delete button clicked");
  console.log("photos.js  LINE 92: req.params =", req.params.photoid)
  const photoIdDelete = req.params.photoid;  // get _id of photo to delete
  try {
    // delete photo(_id=photoid) and assign to variable photoToDelete
    const photoToDelete = await PhotoService.delete(photoIdDelete );
    if (photoToDelete) { // if 
      console.log('photos.js LINE 102:  Document deleted =', photoToDelete);
    } 
    else {
      console.log('photos.js LINE 104:  No document found with the specified ID');
    }
    res.redirect('/photos/');  // List photos with selected file deleted
  } 
  catch (err) {
    console.error('photos.js LINE 107:  Error deleting document:', err);
    res.status(500).send('Error deleting the photo');
  }
});
//----------------------------------------------------------------------------------
// Upload a photo to the collection
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) { // If no file selected...
      req.flash('noFileSelected', "No file selected. Please select a file to upload.");
      console.log("LINE 184:  req.file doesn't exist");
      return next(new Error("noFileSelected")); // Pass the error to the global error handler
    }
    const path = "/static/img/" + req.file.filename; //create path to file in /public/img/
    const photoData = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      imageurl: path,
      title: req.body.title,
      comment: req.body.comment,
      description: req.body.description, 
      location: req.body.location,
      year: req.body.year,
      filename: req.file.filename,
      size: req.file.size / 1024 | 0
    };
    // const photo = new Photo(photoData); // create new Photo object 
    await PhotoService.create(photoData); // Save the photo to the database

    res.redirect('/photos'); // Redirect to the photos page after successful save
  } 
  catch (err) {
    // Handle all errors in one place
    console.log('photos.js LINE 208 ERROR - file not selected');
    console.error("Error processing photo upload:", err);
    next(err); // Pass the error to the global error handler
  }
});
//----------------------------------------------------------------------------------
// handle errors
router.use(function(err, req, res, next){
  console.error(err.stack);
  if (err.message == "OnlyImageFilesAllowed"){ // if don't select image file (eg. file.xls)
      req.flash('fileUploadError',  
        // create flash message with key = fileUploadError in req.flash object
        "Please select an image file with a jpg, png, or gif filename extension.");
      res.redirect('/photos#newPhotoForm');
  } 
  else if (err.message == "PhotoSaveError"){ 
    // create flash message with key = fileUploadError in req.flash object
    req.flash('photoSaveError', "There was a problem saving your photo.");
    res.redirect('/photos');
    console.log("photos.js LINE 226: ERROR - photoSaveError");
  } 
  else if (err.message === "noFileSelected"){
    console.log("photos.js LINE 227: ERROR - no file selected");
    res.redirect('/photos#newPhotoForm');
  }
  else{
     next(err);
  }
});
module.exports = router;
