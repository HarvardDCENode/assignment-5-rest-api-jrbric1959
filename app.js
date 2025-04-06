// app.js

const express = require('express');
const path = require('path');
const photos = require('./routes/api/photos');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// connect to MongoDB database @cluster0.yqrjb.mongodb.net/photoDB
mongoose.connect(process.env.MONGO_URI);
app.use(cookieParser('cscie31-secret')); // parse/manage cookies, create req.cookies
app.use(session({ // use express-session to handle user sessions and store session data on server
  secret:"cscie31",
  resave: "true",
  saveUninitialized: "true"
}));
// parse urlencoded data in body of req, false: simple values/arrays in body
app.use(bodyparser.urlencoded({extended: false}));
// tell render(filename.pug) to look in views at this path 
app.set('views', path.join(__dirname, 'views'));  // set path to views folder
app.set('view engine', 'pug'); // use pug templating engine
// Set ../public as static route to /img directory for storing uploaded images
app.use('/static', express.static(path.join(__dirname, 'public')));
console.log("app.js LINE 37 __dirname = ", __dirname);
app.use('/photos', photos); // set /photos as base path for route handlers in photo.js 
app.get('/', (req, res) => {
  res.render('homepage'); // Requests to the root directory will render views/homepage.pug
});
app.use((req, res, next)=>{  // if routes above not requested
  var err = new Error(`Resource Not Found ${req.url}`);  // error message
  err.status = 404;  // err status set to 404
  next(err);
});
app.use((err, req, res, next)=>{
  if (err.status == 404){  // if err.status = 404
    res.status(404).send(`Cannot find ${req.url}`); // send message with url
  } 
});

module.exports = app;
